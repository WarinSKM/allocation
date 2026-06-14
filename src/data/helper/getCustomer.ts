import customerDb from "@/data/db/customers.json";

export type Customer = (typeof customerDb)[0];

const customerStore: Customer[] = structuredClone(customerDb);

export { customerStore };
