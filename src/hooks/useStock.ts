import { useDataContext } from "@/contexts/dataContext";
import type { Warehouse } from "@/data/helper/getWarehouse";
import type { WarehouseSupplierProduct } from "@/data/helper/getWarehouseSupplierProduct";
import { wspStore } from "@/data/helper/getWarehouseSupplierProduct";
import { useMemo } from "react";

function getTotalStockLeft(data: WarehouseSupplierProduct[]) {
  return data.reduce((prev, curr) => prev + curr.stock, 0);
}

const totalStock = getTotalStockLeft(wspStore);

export default function useStock() {
  const dataContext = useDataContext();

  const allWarehouse = useMemo(() => {
    return [{ value: "ALL", label: "All Warehouse" }, { value: "WH-000", label: "Any Warehouse" }, ...dataContext.data.warehouse.map((item) => ({ value: item.warehouse_id, label: item.warehouse_name }))];
  }, [dataContext.data.warehouse]);
  const allWarehouseOptions = useMemo(() => {
    return [{ value: "WH-000", label: "Any Warehouse" }, ...dataContext.data.warehouse.map((item) => ({ value: item.warehouse_id, label: item.warehouse_name }))];
  }, [dataContext.data.warehouse]);

  const totalStockLeft = useMemo(() => {
    return getTotalStockLeft(dataContext.data.wsp);
  }, [dataContext.data.wsp]);

  const eachWarehouseStockLeft = useMemo(() => {
    const result: Map<string, { warehose: Warehouse; stockLeft: number }> = new Map();
    const wspdata = dataContext.data.wsp;
    for (let wsp of wspdata) {
      const currWareHouse = dataContext.data.warehouse.find((item) => item.warehouse_id === wsp.warehouse_id);
      if (!currWareHouse) continue;
      if (!result.get(currWareHouse.warehouse_id)) {
        result.set(currWareHouse.warehouse_id, { warehose: currWareHouse, stockLeft: wsp.stock });
      } else {
        const prev = result.get(currWareHouse.warehouse_id)!;
        result.set(currWareHouse.warehouse_id, { warehose: currWareHouse, stockLeft: prev.stockLeft + wsp.stock });
      }
    }
    return Array.from(result.values());
  }, [dataContext.data.wsp, dataContext.data.warehouse]);

  const stockLeftPct = useMemo(() => {
    return Math.round((totalStockLeft / totalStock) * 100);
  }, [totalStockLeft]);

  const fullStockPerWarehouse = useMemo(() => {
    const warehoseMap = new Map<string, number>();
    for (let wsp of wspStore) {
      if (!warehoseMap.get(wsp.warehouse_id)) {
        warehoseMap.set(wsp.warehouse_id, wsp.stock);
      } else {
        const prev = warehoseMap.get(wsp.warehouse_id)!;
        warehoseMap.set(wsp.warehouse_id, prev + wsp.stock);
      }
    }
    return warehoseMap;
  }, []);

  return { eachWarehouseStockLeft, totalStockLeft, totalStock, stockLeftPct, fullStockPerWarehouse, allWarehouse, allWarehouseOptions };
}

export { getTotalStockLeft };
