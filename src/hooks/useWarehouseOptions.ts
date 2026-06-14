import { useDataContext } from "@/contexts/dataContext";
import { ANY_WAREHOUSE_ID, ALL_FILTER_VALUE } from "@/constants";
import { useMemo } from "react";

export default function useWarehouseOptions() {
  const dataContext = useDataContext();

  const warehouseFilterOptions = useMemo(() => {
    return [
      { value: ALL_FILTER_VALUE,  label: "All Warehouse" },
      { value: ANY_WAREHOUSE_ID,  label: "Any Warehouse" },
      ...dataContext.data.warehouse.map((item) => ({ value: item.warehouse_id, label: item.warehouse_name })),
    ];
  }, [dataContext.data.warehouse]);

  const warehouseSourceOptions = useMemo(() => {
    return [
      { value: ANY_WAREHOUSE_ID, label: "Any Warehouse" },
      ...dataContext.data.warehouse.map((item) => ({ value: item.warehouse_id, label: item.warehouse_name })),
    ];
  }, [dataContext.data.warehouse]);

  return { warehouseFilterOptions, warehouseSourceOptions };
}
