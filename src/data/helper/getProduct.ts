import productsDb from "@/data/db/products.json";

export type Product = (typeof productsDb)[0];

const productStore: Product[] = structuredClone(productsDb);

export { productStore };
