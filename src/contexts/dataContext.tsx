import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initData } from "@/data/helper";
import { type AllocationStatus } from "@/constants";
import { bankersRound } from "@/lib/round";
import { runAutoAllocation } from "@/lib/allocation";

type DataContextType = {
  data: typeof initData;
  setData: React.Dispatch<React.SetStateAction<typeof initData>>;
  setCustomerCredit: (customer_id: string, amount: number) => void;
  setSubOrderFill: (sub_order_id: string, amount: number) => void;
  setStockLeft: (params: { warehouse_id: string; supplier_id: string; product_id: string; amount: number }) => void;
  setSubOrderWsp: (sub_order_id: string, warehouse_supplier_product_id: string) => void;
  setSubOrderStatus: (sub_order_id: string, status: AllocationStatus) => void;
  increaseManualCount: () => void;
  manualCount: number;
};

const initValue: DataContextType = {
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

export function DataContextProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initData);
  const [manualCount, setManualCount] = useState(0);

  function setCustomerCredit(customer_id: string, amount: number) {
    setData((prev) => {
      const customer = prev.customer.find((c) => c.customer_id === customer_id);
      if (!customer) return prev;
      return {
        ...prev,
        customer: prev.customer.map((c) =>
          c.customer_id === customer_id
            ? { ...c, credit: bankersRound(c.credit - amount) }
            : c,
        ),
      };
    });
  }

  function setSubOrderFill(sub_order_id: string, amount: number) {
    setData((prev) => ({
      ...prev,
      subOrder: prev.subOrder.map((so) =>
        so.sub_order_id === sub_order_id
          ? { ...so, allocated_qty: so.allocated_qty + amount }
          : so,
      ),
    }));
  }

  function setStockLeft({ warehouse_id, supplier_id, product_id, amount }: { warehouse_id: string; supplier_id: string; product_id: string; amount: number }) {
    setData((prev) => ({
      ...prev,
      wsp: prev.wsp.map((w) =>
        w.warehouse_id === warehouse_id && w.supplier_id === supplier_id && w.product_id === product_id
          ? { ...w, stock: w.stock - amount }
          : w,
      ),
    }));
  }

  function setSubOrderWsp(sub_order_id: string, warehouse_supplier_product_id: string) {
    setData((prev) => ({
      ...prev,
      subOrder: prev.subOrder.map((so) =>
        so.sub_order_id === sub_order_id
          ? { ...so, warehouse_supplier_product_id, allocation_method: 'MANUAL' }
          : so,
      ),
    }));
  }

  function setSubOrderStatus(sub_order_id: string, status: AllocationStatus) {
    setData((prev) => ({
      ...prev,
      subOrder: prev.subOrder.map((so) =>
        so.sub_order_id === sub_order_id ? { ...so, status } : so,
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

  return (
    <DataContext.Provider value={{ data, setData, setCustomerCredit, setSubOrderFill, setStockLeft, setSubOrderWsp, setSubOrderStatus, increaseManualCount, manualCount }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  return useContext(DataContext);
}
