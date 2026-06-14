import ordersDb from "@/data/db/orders.json";

export type Order = (typeof ordersDb)[0];

const orderStore: Order[] = structuredClone(ordersDb);

export { orderStore };
