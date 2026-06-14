import subordersDb from "@/data/db/suborders.json";

export type SubOrder = (typeof subordersDb)[0];

const subOrderStore: SubOrder[] = structuredClone(subordersDb);

export { subOrderStore };
