import type { SubOrderData } from "@/hooks/useAllocation";

export type SortKey = "order" | "subOrder" | "type" | "request" | "fill" | "value" | "availableCredit" | "createDate" | "product" | "customer" | "warehouse" | "supplier";
export type SortDir = "asc" | "desc" | null;

export function getSortValue(row: SubOrderData, key: SortKey): string | number {
  switch (key) {
    case "product":
      return row.product.product_name;
    case "customer":
      return row.customer.customer_name;
    case "warehouse":
      return row.warehouse.warehouse_name;
    case "supplier":
      return row.supplier.supplier_name;
    case "createDate":
      return new Date(row.createDate).getTime();
    default:
      return row[key] as string | number;
  }
}

export function sortSubOrderData(data: SubOrderData[], key: SortKey, dir: SortDir): SubOrderData[] {
  return [...data].sort((a, b) => {
    const d = dir === "asc" ? 1 : -1;
    const aVal = getSortValue(a, key);
    const bVal = getSortValue(b, key);
    if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * d;
    return String(aVal).localeCompare(String(bVal)) * d;
  });
}
