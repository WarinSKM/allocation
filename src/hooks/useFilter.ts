import { useState } from "react";

export function useFilter() {
  const [source, setSource] = useState("any");
  const [status, setStatus] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [emergency, setEmergency] = useState(false);
  const [overdue, setOverdue] = useState(false);
  const [daily, setDaily] = useState(false);
  const [exceptions, setExceptions] = useState(false);

  const filter = {
    source,
    status,
    warehouse,
    supplier,
    emergency,
    overdue,
    daily,
    exceptions,
  };
  return {
    filter,
    setFilter: (key: string, value: any) => {
      setFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
  };
}
