import warehousesDb from "@/data/db/warehouses.json";

export type Warehouse = (typeof warehousesDb)[0];

const warehouseStore: Warehouse[] = structuredClone(warehousesDb);

export { warehouseStore };
