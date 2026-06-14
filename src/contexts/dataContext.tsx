import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initData, type Customer, type Data, type Product, type WarehouseSupplierProduct } from "@/data/helper";
import type { SubOrder } from "@/data/helper/getSubOrder";
import type { Order } from "@/data/helper/getOrder";
import { ANY_WAREHOUSE_ID, ANY_SUPPLIER_ID, TYPE_MULTIPLIER, type AllocationStatus } from "@/constants";
import { bankersRound } from "@/lib/round";

type DataContextType = {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  setCustomerCredit: (customer_id: string, amount: number) => void;
  setSubOrderFill: (subOrder_id: string, amount: number) => void;
  setStockLeft: ({ warehouse_id, supplier_id, product_id, amount }: { warehouse_id: string; supplier_id: string; product_id: string, amount: number }) => void;
  setSubOrderWsp: (sub_order_id: string, warehouse_supplier_product_id: string) => void;
  setSubOrderStatus: (sub_order_id: string, status: AllocationStatus) => void;
  increaseManualCount: () => void;
  manualCount: number;
};

function getDataById<T>({ id, data, key }: { id: string; data: T[]; key: keyof T }): T | undefined {
  return data.find((item) => item[key] === id);
}

function sortSubOrdersByPriority(subOrder: SubOrder[], order: Order[]) {

  const emergencyData = subOrder.filter((item) => item.type === "EMERGENCY");
  const overdueData = subOrder.filter((item) => item.type === "OVER_DUE");
  const dailyData = subOrder.filter((item) => item.type === "DAILY");

  const sortedEmergencyData = emergencyData.sort((a, b) => {
    const orderA = getDataById<Order>({ id: a.order_id, data: order, key: 'order_id' })
    const orderB = getDataById<Order>({ id: b.order_id, data: order, key: 'order_id' })
    if (!orderA || !orderB) return 0;
    return new Date(orderA.create_date).getTime() - new Date(orderB.create_date).getTime();
  });

  const sortedOverdueData = overdueData.sort((a, b) => {
    const orderA = getDataById<Order>({ id: a.order_id, data: order, key: 'order_id' })
    const orderB = getDataById<Order>({ id: b.order_id, data: order, key: 'order_id' })
    if (!orderA || !orderB) return 0;
    return new Date(orderA.create_date).getTime() - new Date(orderB.create_date).getTime();
  });

  const sortedDailyData = dailyData.sort((a, b) => {
    const orderA = getDataById<Order>({ id: a.order_id, data: order, key: 'order_id' })
    const orderB = getDataById<Order>({ id: b.order_id, data: order, key: 'order_id' })
    if (!orderA || !orderB) return 0;
    return new Date(orderA.create_date).getTime() - new Date(orderB.create_date).getTime();
  });

  const result = [...sortedEmergencyData, ...sortedOverdueData, ...sortedDailyData];
  return result;
}

// ── Find best WSP for "any warehouse / any supplier" fallback ─────────────
function findBestWsp(
  productId: string,
  warehouseId: string,
  supplierId: string,
  stockMap: Map<string, number>,
  wsp: WarehouseSupplierProduct[],
): WarehouseSupplierProduct | undefined {
  const isAnyWarehouse = warehouseId === ANY_WAREHOUSE_ID;
  const isAnySupplier  = supplierId  === ANY_SUPPLIER_ID;

  // Get candidate
  const candidates = wsp.filter((w) => {
    if (w.product_id !== productId) return false;
    if (!isAnyWarehouse && w.warehouse_id !== warehouseId) return false;
    if (!isAnySupplier && w.supplier_id !== supplierId) return false;
    return (stockMap.get(w.warehouse_supplier_product_id) ?? 0) > 0;
  });

  // Sort stock for best candidate
  return candidates.sort(
    (a, b) =>
      (stockMap.get(b.warehouse_supplier_product_id) ?? 0) -
      (stockMap.get(a.warehouse_supplier_product_id) ?? 0),
  )[0];
}

type AllocationResult = Pick<Data, 'subOrder' | 'customer' | 'wsp'>;

function runAutoAllocation(data: Data): AllocationResult {
  // In-memory mutable snapshots
  const creditMap = new Map(data.customer.map((c) => [c.customer_id, c.credit]));
  const stockMap = new Map(data.wsp.map((w) => [w.warehouse_supplier_product_id, w.stock]));
  const updatedSubOrders = new Map<string, SubOrder>();

  // Sort sub order by: emergency > overdue > daily and FIFO
  const sortedSubOrders = sortSubOrdersByPriority(data.subOrder, data.order);

  for (const so of sortedSubOrders) {
    const order = getDataById<Order>({ id: so.order_id, data: data.order, key: 'order_id' });
    if (!order) continue;

    const customer = getDataById<Customer>({ id: order.customer_id, data: data.customer, key: 'customer_id' });
    if (!customer) continue;

    const rawWsp = getDataById<WarehouseSupplierProduct>({ id: so.warehouse_supplier_product_id, data: data.wsp, key: 'warehouse_supplier_product_id' });
    if (!rawWsp) continue;

    // Resolve "any warehouse / any supplier" (WH-000 / SP-000)
    const wsp = (rawWsp.warehouse_id === ANY_WAREHOUSE_ID || rawWsp.supplier_id === ANY_SUPPLIER_ID)
      ? findBestWsp(rawWsp.product_id, rawWsp.warehouse_id, rawWsp.supplier_id, stockMap, data.wsp)
      : rawWsp;

    if (!wsp) {
      updatedSubOrders.set(so.sub_order_id, { ...so, allocated_qty: 0, status: 'UNFILLED', allocation_method: 'AUTO' });
      continue;
    }

    const product = getDataById<Product>({ id: wsp.product_id, data: data.product, key: 'product_id' });
    if (!product) continue;

    const availableStock = stockMap.get(wsp.warehouse_supplier_product_id) ?? 0;
    const availableCredit = creditMap.get(customer.customer_id) ?? 0;
    const unitPrice = bankersRound(product.product_price * (TYPE_MULTIPLIER[so.type] ?? 1.0));

    // In case there is no stock or credit for the sub order
    if (availableStock <= 0 || availableCredit < unitPrice) {
      updatedSubOrders.set(so.sub_order_id, { ...so, allocated_qty: 0, status: 'UNFILLED', allocation_method: 'AUTO' });
      continue;
    }

    // Check stock and credit which one gonna fulfill first
    const maxByStock = Math.min(so.request, availableStock);
    const maxByCredit = Math.floor(availableCredit / unitPrice);
    const allocated = bankersRound(Math.min(maxByStock, maxByCredit));

    const cost = bankersRound(allocated * unitPrice);
    const status = allocated <= 0 ? 'UNFILLED'
      : allocated < so.request ? 'PARTIAL'
        : 'FULFILLED';

    // save to snapshot
    stockMap.set(wsp.warehouse_supplier_product_id, bankersRound(availableStock - allocated));
    creditMap.set(customer.customer_id, bankersRound(availableCredit - cost));
    updatedSubOrders.set(so.sub_order_id, {
      ...so,
      allocated_qty: allocated,
      status,
      allocation_method: 'AUTO',
    });
  }

  return {
    subOrder: data.subOrder.map((so) => updatedSubOrders.get(so.sub_order_id) ?? so),
    customer: data.customer.map((c) => ({ ...c, credit: creditMap.get(c.customer_id) ?? c.credit })),
    wsp: data.wsp.map((w) => ({ ...w, stock: bankersRound(stockMap.get(w.warehouse_supplier_product_id) ?? w.stock) })),
  };
}

const initValue = {
  data: initData,
  manualCount: 0,
  setData: () => { },
  setCustomerCredit: () => { },
  setSubOrderFill: () => { },
  setStockLeft: () => { },
  setSubOrderWsp: () => { },
  setSubOrderStatus: () => { },
  increaseManualCount: () => { },
};

const DataContext = createContext<DataContextType>(initValue);

const DataContextProvider = ({ children }: { children: ReactNode }) => {
  const [manualCount, setManualCount] = useState(0);
  const [data, setData] = useState<typeof initData>(initData);

  function setCustomerCredit(customer_id: string, amount: number) {
    setData((prev) => {
      const customer = prev.customer.find(item => item.customer_id === customer_id);
      if (!customer) return prev;
      const newCustomer = { ...customer, credit: bankersRound(customer.credit - amount) };
      return {
        ...prev,
        customer: prev.customer.map(item => item.customer_id === customer_id ? newCustomer : item),
      };
    });
  }


  function setSubOrderFill(subOrder_id: string, amount: number) {
    setData((prev) => {
      const subOrder = prev.subOrder.find(item => item.sub_order_id === subOrder_id);
      if (!subOrder) return prev;
      const newSubOrder = { ...subOrder, allocated_qty: subOrder.allocated_qty + amount };
      return {
        ...prev,
        subOrder: prev.subOrder.map(item => item.sub_order_id === subOrder_id ? newSubOrder : item),
      };
    });
  }

  function setStockLeft({ warehouse_id, supplier_id, product_id, amount }: { warehouse_id: string; supplier_id: string; product_id: string, amount: number }) {
    setData((prev) => {
      const wsp = prev.wsp.find(item => item.warehouse_id === warehouse_id && item.supplier_id === supplier_id && item.product_id === product_id);
      if (!wsp) return prev;
      const newWsp = { ...wsp, stock: wsp.stock - amount };
      return {
        ...prev,
        wsp: prev.wsp.map(item => item.warehouse_id === warehouse_id && item.supplier_id === supplier_id && item.product_id === product_id ? newWsp : item),
      };
    });
  }

  function setSubOrderWsp(sub_order_id: string, warehouse_supplier_product_id: string) {
    setData((prev) => {
      const subOrder = prev.subOrder.find(item => item.sub_order_id === sub_order_id);
      if (!subOrder) return prev;
      return {
        ...prev,
        subOrder: prev.subOrder.map(item =>
          item.sub_order_id === sub_order_id
            ? { ...item, warehouse_supplier_product_id, allocation_method: 'MANUAL' }
            : item
        ),
      };
    });
  }

  function setSubOrderStatus(sub_order_id: string, status: AllocationStatus) {
    setData((prev) => ({
      ...prev,
      subOrder: prev.subOrder.map(item =>
        item.sub_order_id === sub_order_id ? { ...item, status } : item
      ),
    }));
  }

  function increaseManualCount() {
    setManualCount((prev) => prev + 1);
  }

  useEffect(() => {
    const result = runAutoAllocation(initData);
    setData((prev) => ({ ...prev, ...result }));
  }, []);

  return <DataContext.Provider value={{ ...initValue, data, setData, setCustomerCredit, setSubOrderFill, setStockLeft, setSubOrderWsp, setSubOrderStatus, increaseManualCount, manualCount }}>{children}</DataContext.Provider>;
};

const useDataContext = () => {
  return useContext(DataContext);
};

export { DataContextProvider, useDataContext, sortSubOrdersByPriority, runAutoAllocation, findBestWsp };
export { bankersRound } from "@/lib/round";
export type { AllocationResult };
