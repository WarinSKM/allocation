export type AllocationStatus = "FULFILLED" | "PARTIAL" | "UNFILLED" | "PENDING";
export type AllocationMethod = "AUTO" | "MANUAL";

export const ANY_WAREHOUSE_ID = "WH-000";
export const ANY_SUPPLIER_ID = "SP-000";
export const ALL_FILTER_VALUE = "ALL";

export const TYPE_MULTIPLIER: Record<string, number> = {
  EMERGENCY: 1.25,
  OVER_DUE: 1.0,
  DAILY: 0.9,
};
