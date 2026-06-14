import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { SubOrderData } from "@/hooks/useAllocation";
import type { SubOrderType } from "@/data/helper";
import { ALL_FILTER_VALUE } from "@/constants";
import { applyFilters, type FilterStatus, type FilterSource } from "@/lib/filter";

export type { FilterStatus, FilterSource };

type FilterContextType = {
  types:         Set<SubOrderType>;
  status:        FilterStatus;
  source:        FilterSource;
  warehouse:     string;
  supplier:      string;
  search:        string;
  toggleType:    (type: SubOrderType) => void;
  setStatus:     (status: FilterStatus) => void;
  setSource:     (source: FilterSource) => void;
  setWarehouse:  (warehouse: string) => void;
  setSupplier:   (supplier: string) => void;
  setSearch:     (search: string) => void;
  filterData:    (data: SubOrderData[]) => SubOrderData[];
};

const ALL_TYPES = new Set<SubOrderType>(['EMERGENCY', 'OVER_DUE', 'DAILY']);

const FilterContext = createContext<FilterContextType>({
  types:        new Set(ALL_TYPES),
  status:       'all',
  source:       'any',
  warehouse:    ALL_FILTER_VALUE,
  supplier:     ALL_FILTER_VALUE,
  search:       '',
  toggleType:   () => {},
  setStatus:    () => {},
  setSource:    () => {},
  setWarehouse: () => {},
  setSupplier:  () => {},
  setSearch:    () => {},
  filterData:   (data) => data,
});

export function FilterContextProvider({ children }: { children: ReactNode }) {
  const [types, setTypes]       = useState<Set<SubOrderType>>(new Set(ALL_TYPES));
  const [status, setStatus]     = useState<FilterStatus>('all');
  const [source, setSource]     = useState<FilterSource>('any');
  const [warehouse, setWarehouse] = useState(ALL_FILTER_VALUE);
  const [supplier, setSupplier]   = useState(ALL_FILTER_VALUE);
  const [search, setSearch]       = useState('');

  function toggleType(type: SubOrderType) {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const filterData = useCallback(
    (data: SubOrderData[]) => applyFilters(data, { types, status, source, warehouse, supplier, search }),
    [types, status, source, warehouse, supplier, search],
  );

  return (
    <FilterContext.Provider value={{ types, status, source, warehouse, supplier, search, toggleType, setStatus, setSource, setWarehouse, setSupplier, setSearch, filterData }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  return useContext(FilterContext);
}
