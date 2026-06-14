import type { Customer, Data, Product, WarehouseSupplierProduct } from "@/data/helper";
import type { SubOrder } from "@/data/helper/getSubOrder";
import type { Order } from "@/data/helper/getOrder";
import { ANY_WAREHOUSE_ID, ANY_SUPPLIER_ID, TYPE_MULTIPLIER } from "@/constants";
import { bankersRound } from "@/lib/round";

export type AllocationResult = Pick<Data, "subOrder" | "customer" | "wsp">;

export function getDataById<T>({ id, data, key }: { id: string; data: T[]; key: keyof T }): T | undefined {
  return data.find((item) => item[key] === id);
}

export function sortSubOrdersByPriority(subOrders: SubOrder[], orders: Order[]): SubOrder[] {
  const orderMap = new Map(orders.map((o) => [o.order_id, o]));

  const byDate = (a: SubOrder, b: SubOrder) => {
    const dateA = orderMap.get(a.order_id)?.create_date;
    const dateB = orderMap.get(b.order_id)?.create_date;
    if (!dateA || !dateB) return 0;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  };

  return [...subOrders.filter((s) => s.type === "EMERGENCY").sort(byDate), ...subOrders.filter((s) => s.type === "OVER_DUE").sort(byDate), ...subOrders.filter((s) => s.type === "DAILY").sort(byDate)];
}

export function findBestWsp(productId: string, warehouseId: string, supplierId: string, stockMap: Map<string, number>, wsps: WarehouseSupplierProduct[]): WarehouseSupplierProduct | undefined {
  const isAnyWarehouse = warehouseId === ANY_WAREHOUSE_ID;
  const isAnySupplier = supplierId === ANY_SUPPLIER_ID;

  return wsps
    .filter((w) => {
      if (w.product_id !== productId) return false;
      if (!isAnyWarehouse && w.warehouse_id !== warehouseId) return false;
      if (!isAnySupplier && w.supplier_id !== supplierId) return false;
      return (stockMap.get(w.warehouse_supplier_product_id) ?? 0) > 0;
    })
    .sort((a, b) => (stockMap.get(b.warehouse_supplier_product_id) ?? 0) - (stockMap.get(a.warehouse_supplier_product_id) ?? 0))[0];
}

export function runAutoAllocation(data: Data): AllocationResult {
  const creditMap = new Map(data.customer.map((c) => [c.customer_id, c.credit]));
  const stockMap = new Map(data.wsp.map((w) => [w.warehouse_supplier_product_id, w.stock]));
  const updatedSubOrders = new Map<string, SubOrder>();

  for (const so of sortSubOrdersByPriority(data.subOrder, data.order)) {
    const order = getDataById<Order>({ id: so.order_id, data: data.order, key: "order_id" });
    if (!order) continue;

    const customer = getDataById<Customer>({ id: order.customer_id, data: data.customer, key: "customer_id" });
    if (!customer) continue;

    const rawWsp = getDataById<WarehouseSupplierProduct>({ id: so.warehouse_supplier_product_id, data: data.wsp, key: "warehouse_supplier_product_id" });
    if (!rawWsp) continue;

    const wsp = rawWsp.warehouse_id === ANY_WAREHOUSE_ID || rawWsp.supplier_id === ANY_SUPPLIER_ID ? findBestWsp(rawWsp.product_id, rawWsp.warehouse_id, rawWsp.supplier_id, stockMap, data.wsp) : rawWsp;

    if (!wsp) {
      updatedSubOrders.set(so.sub_order_id, { ...so, allocated_qty: 0, status: "UNFILLED", allocation_method: "AUTO" });
      continue;
    }

    const product = getDataById<Product>({ id: wsp.product_id, data: data.product, key: "product_id" });
    if (!product) continue;

    const availableStock = stockMap.get(wsp.warehouse_supplier_product_id) ?? 0;
    const availableCredit = creditMap.get(customer.customer_id) ?? 0;
    const unitPrice = bankersRound(product.product_price * (TYPE_MULTIPLIER[so.type] ?? 1.0));

    if (availableStock <= 0 || availableCredit < unitPrice) {
      updatedSubOrders.set(so.sub_order_id, { ...so, allocated_qty: 0, status: "UNFILLED", allocation_method: "AUTO" });
      continue;
    }

    const allocated = bankersRound(Math.min(so.request, availableStock, Math.floor(availableCredit / unitPrice)));
    const cost = bankersRound(allocated * unitPrice);
    const status = allocated <= 0 ? "UNFILLED" : allocated < so.request ? "PARTIAL" : "FULFILLED";

    stockMap.set(wsp.warehouse_supplier_product_id, bankersRound(availableStock - allocated));
    creditMap.set(customer.customer_id, bankersRound(availableCredit - cost));
    updatedSubOrders.set(so.sub_order_id, { ...so, allocated_qty: allocated, status, allocation_method: "AUTO" });
  }

  return {
    subOrder: data.subOrder.map((so) => updatedSubOrders.get(so.sub_order_id) ?? so),
    customer: data.customer.map((c) => ({ ...c, credit: creditMap.get(c.customer_id) ?? c.credit })),
    wsp: data.wsp.map((w) => ({ ...w, stock: bankersRound(stockMap.get(w.warehouse_supplier_product_id) ?? w.stock) })),
  };
}
