import { useDataContext } from "@/contexts/dataContext";
import { ANY_SUPPLIER_ID, ALL_FILTER_VALUE } from "@/constants";
import { useMemo } from "react";

export default function useSupplierOptions() {
  const dataContext = useDataContext();

  const supplierFilterOptions = useMemo(() => {
    return [
      { value: ALL_FILTER_VALUE, label: "All Supplier" },
      { value: ANY_SUPPLIER_ID,  label: "Any Supplier" },
      ...dataContext.data.supplier.map((item) => ({ value: item.supplier_id, label: item.supplier_name })),
    ];
  }, [dataContext.data.supplier]);

  const supplierSourceOptions = useMemo(() => {
    return [
      { value: ANY_SUPPLIER_ID, label: "Any Supplier" },
      ...dataContext.data.supplier.map((item) => ({ value: item.supplier_id, label: item.supplier_name })),
    ];
  }, [dataContext.data.supplier]);

  return { supplierFilterOptions, supplierSourceOptions };
}
