import { useDataContext } from "@/contexts/dataContext";
import { useMemo } from "react";

export default function useSupplier() {
  const dataContext = useDataContext();

  const allSupplier = useMemo(() => {
    return [{ value: "ALL", label: "All Supplier" }, { value: "S-000", label: "Any Supplier" }, ...dataContext.data.supplier.map((item) => ({ value: item.supplier_id, label: item.supplier_name }))];
  }, [dataContext.data.supplier]);

  return { allSupplier };
}
