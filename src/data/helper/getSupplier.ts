import suppliersDb from "@/data/db/suppliers.json";

export type Supplier = (typeof suppliersDb)[0];

const supplierStore: Supplier[] = structuredClone(suppliersDb);

export { supplierStore };
