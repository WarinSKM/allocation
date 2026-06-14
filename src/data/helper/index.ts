import { type Customer, customerStore } from "./getCustomer";
import { type Order, orderStore } from "./getOrder";
import { type Product, productStore } from "./getProduct";
import { type SubOrder, subOrderStore } from "./getSubOrder";
import { type Supplier, supplierStore } from "./getSupplier";
import { type Warehouse, warehouseStore } from "./getWarehouse";
import { type WarehouseSupplierProduct, wspStore } from "./getWarehouseSupplierProduct";

type SubOrderType = "EMERGENCY" | "OVER_DUE" | "DAILY";

const initData = {
  customer: structuredClone(customerStore),
  order: structuredClone(orderStore),
  product: structuredClone(productStore),
  subOrder: structuredClone(subOrderStore),
  supplier: structuredClone(supplierStore),
  warehouse: structuredClone(warehouseStore),
  wsp: structuredClone(wspStore),
};

type Data = typeof initData;

export { initData, type Data };

export type { Customer, Order, Product, SubOrder, Supplier, Warehouse, WarehouseSupplierProduct, SubOrderType };
