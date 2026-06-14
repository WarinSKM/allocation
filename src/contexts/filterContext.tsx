import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { SubOrderData } from "@/hooks/useAllocation";
import type { SubOrderType } from "@/data/helper";

export type FilterStatus = 'all' | 'unfilled' | 'partial' | 'filled' | 'exceptions';
export type FilterSource = 'any' | 'auto' | 'manual';

type FilterContextType = {
    types: Set<SubOrderType>;
    status: FilterStatus;
    source: FilterSource;
    warehouse: string;
    supplier: string;
    search: string;
    toggleType: (type: SubOrderType) => void;
    setStatus: (status: FilterStatus) => void;
    setSource: (source: FilterSource) => void;
    setWarehouse: (warehouse: string) => void;
    setSupplier: (supplier: string) => void;
    setSearch: (search: string) => void;
    filterData: (data: SubOrderData[]) => SubOrderData[];
};

const ALL_TYPES = new Set<SubOrderType>(['EMERGENCY', 'OVER_DUE', 'DAILY']);

const FilterContext = createContext<FilterContextType>({
    types: new Set(ALL_TYPES),
    status: 'all',
    source: 'any',
    warehouse: 'ALL',
    supplier: 'ALL',
    search: '',
    toggleType: () => { },
    setStatus: () => { },
    setSource: () => { },
    setWarehouse: () => { },
    setSupplier: () => { },
    setSearch: () => { },
    filterData: (data) => data,
});

export function FilterContextProvider({ children }: { children: ReactNode }) {
    const [types, setTypes] = useState<Set<SubOrderType>>(new Set(ALL_TYPES));
    const [status, setStatus] = useState<FilterStatus>('all');
    const [source, setSource] = useState<FilterSource>('any');
    const [warehouse, setWarehouse] = useState('ALL');
    const [supplier, setSupplier] = useState('ALL');
    const [search, setSearch] = useState('');

    function toggleType(type: SubOrderType) {
        setTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    }

    const filterData = useCallback((data: SubOrderData[]): SubOrderData[] => {
        return data.filter((row) => {
            if (!types.has(row.type)) return false;

            if (status !== 'all') {
                switch (status) {
                    case 'unfilled': if (row.status !== 'UNFILLED') return false; break;
                    case 'partial': if (row.status !== 'PARTIAL') return false; break;
                    case 'filled': if (row.status !== 'FULFILLED') return false; break;
                    case 'exceptions': if (row.status !== 'UNFILLED' && row.status !== 'PARTIAL') return false; break;
                }
            }

            if (source !== 'any') {
                switch (source) {
                    case 'auto': if (row.allocationMethod !== 'AUTO') return false; break;
                    case 'manual': if (row.allocationMethod !== 'MANUAL') return false; break;
                }
            }

            if (warehouse !== 'ALL' && row.warehouse.warehouse_id !== warehouse) return false;
            if (supplier !== 'ALL' && row.supplier.supplier_id !== supplier) return false;

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
    }, [types, status, source, warehouse, supplier, search]);

    return (
        <FilterContext.Provider value={{ types, status, source, warehouse, supplier, search, toggleType, setStatus, setSource, setWarehouse, setSupplier, setSearch, filterData }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilterContext() {
    return useContext(FilterContext);
}
