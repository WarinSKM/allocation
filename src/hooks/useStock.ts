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

  const totalStockLeft = useMemo(() => {
    return getTotalStockLeft(dataContext.data.wsp);
  }, [dataContext.data.wsp]);

  const eachWarehouseStockLeft = useMemo(() => {
    const result: Map<string, { warehouse: Warehouse; stockLeft: number }> = new Map();
    const wspdata = dataContext.data.wsp;
    for (const wsp of wspdata) {
      const currWarehouse = dataContext.data.warehouse.find((item) => item.warehouse_id === wsp.warehouse_id);
      if (!currWarehouse) continue;
      if (!result.get(currWarehouse.warehouse_id)) {
        result.set(currWarehouse.warehouse_id, { warehouse: currWarehouse, stockLeft: wsp.stock });
      } else {
        const prev = result.get(currWarehouse.warehouse_id)!;
        result.set(currWarehouse.warehouse_id, { warehouse: currWarehouse, stockLeft: prev.stockLeft + wsp.stock });
      }
    }
    return Array.from(result.values());
  }, [dataContext.data.wsp, dataContext.data.warehouse]);

  const stockLeftPct = useMemo(() => {
    return Math.round((totalStockLeft / totalStock) * 100);
  }, [totalStockLeft]);

  const fullStockPerWarehouse = useMemo(() => {
    const warehouseMap = new Map<string, number>();
    for (const wsp of wspStore) {
      if (!warehouseMap.get(wsp.warehouse_id)) {
        warehouseMap.set(wsp.warehouse_id, wsp.stock);
      } else {
        const prev = warehouseMap.get(wsp.warehouse_id)!;
        warehouseMap.set(wsp.warehouse_id, prev + wsp.stock);
      }
    }
    return warehouseMap;
  }, []);

  return { eachWarehouseStockLeft, totalStockLeft, totalStock, stockLeftPct, fullStockPerWarehouse };
}

export { getTotalStockLeft };
