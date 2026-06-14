import warehouseSupplierProductsDb from "@/data/db/warehouse_supplier_products.json";

export type WarehouseSupplierProduct = (typeof warehouseSupplierProductsDb)[0];

const wspStore: WarehouseSupplierProduct[] = structuredClone(warehouseSupplierProductsDb);

export { wspStore };
