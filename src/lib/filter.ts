import type { SubOrderData } from "@/hooks/useAllocation";
import type { SubOrderType } from "@/data/helper";
import { ALL_FILTER_VALUE } from "@/constants";

export type FilterStatus = 'all' | 'unfilled' | 'partial' | 'filled' | 'exceptions';
export type FilterSource = 'any' | 'auto' | 'manual';

export type FilterState = {
  types:     Set<SubOrderType>;
  status:    FilterStatus;
  source:    FilterSource;
  warehouse: string;
  supplier:  string;
  search:    string;
};

export function applyFilters(data: SubOrderData[], state: FilterState): SubOrderData[] {
  const { types, status, source, warehouse, supplier, search } = state;

  return data.filter((row) => {
    if (!types.has(row.type)) return false;

    if (status !== 'all') {
      switch (status) {
        case 'unfilled':   if (row.status !== 'UNFILLED')  return false; break;
        case 'partial':    if (row.status !== 'PARTIAL')   return false; break;
        case 'filled':     if (row.status !== 'FULFILLED') return false; break;
        case 'exceptions': if (row.status !== 'UNFILLED' && row.status !== 'PARTIAL') return false; break;
      }
    }

    if (source !== 'any') {
      switch (source) {
        case 'auto':   if (row.allocationMethod !== 'AUTO')   return false; break;
        case 'manual': if (row.allocationMethod !== 'MANUAL') return false; break;
      }
    }

    if (warehouse !== ALL_FILTER_VALUE && row.warehouse.warehouse_id !== warehouse) return false;
    if (supplier  !== ALL_FILTER_VALUE && row.supplier.supplier_id   !== supplier)  return false;

    if (search) {
      const q = search.toLowerCase();
      if (
        !row.order.toLowerCase().includes(q) &&
        !row.subOrder.toLowerCase().includes(q) &&
        !row.customer.customer_name.toLowerCase().includes(q) &&
        !row.product.product_name.toLowerCase().includes(q)
      ) return false;
    }

    return true;
  });
}
