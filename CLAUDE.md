# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite, usually http://localhost:5173)
npm run build      # tsc type-check + Vite production build
npm run lint       # ESLint
npx tsc --noEmit   # type-check only (faster than full build)
npm run mock       # regenerate mock JSON data via scripts/generate-mock-data.mjs
```

No test runner is configured.

## Path alias

`@/` maps to `src/`. Use it for all internal imports (e.g. `@/contexts/dataContext`).

## Architecture

### Data layer — `src/data/`

All data is static JSON in `src/data/db/`. Each entity has a typed helper in `src/data/helper/` that exports a store (a `structuredClone` of the raw JSON) and its TypeScript type derived via `typeof`. The `src/data/helper/index.ts` aggregates everything into `initData` (the canonical initial snapshot) and exports all types.

Entities: `customers`, `orders`, `suborders`, `products`, `suppliers`, `warehouses`, `warehouse_supplier_products` (WSP).

A WSP (`warehouse_supplier_product`) is the join between a warehouse, supplier, and product. It carries the current `stock` value. The composite key `warehouse_supplier_product_id` is formatted as `WH-XXX-SP-XXX-P-XXX`. `WH-000` / `SP-000` are wildcard sentinels meaning "any warehouse / any supplier — pick highest stock".

### State — `src/contexts/dataContext.tsx`

Single React context holding the entire mutable application state. On mount it runs `runAutoAllocation(initData)` once to fill sub-orders using the allocation engine.

Key pure/exported functions (all testable without React):
- `runAutoAllocation(data: Data): AllocationResult` — allocates stock across all sub-orders using priority order EMERGENCY → OVER_DUE → DAILY, then FIFO by order date. Enforces credit limits and deducts stock/credit from in-memory maps before writing back.
- `bankersRound(value, dp?)` — round-half-to-even used for all monetary/quantity rounding.
- `findBestWsp(productId, warehouseId, supplierId, stockMap, wsp[])` — resolves WH-000/SP-000 wildcards to the single WSP with the highest remaining stock.
- `bestSortForAllocationDataFN(subOrders, orders)` — sorts sub-orders into allocation priority order.

Price = `product.product_price × TYPE_MULTIPLIER[type]` where multipliers are `EMERGENCY: 1.2`, `OVER_DUE: 1.1`, `DAILY: 1.0`.

Context setters (`setSubOrderFill`, `setCustomerCredit`, `setStockLeft`, `setSubOrderWsp`, `setSubOrderStatus`) apply delta mutations. `setSubOrderFill` **adds** its `amount` argument to `allocated_qty` — always pass a delta, not an absolute value.

### Derived data — `src/hooks/`

- `useAllocation` — joins sub-orders with their related entities into `SubOrderData[]`, applies `TYPE_MULTIPLIER` to compute `value`. Returns `useMemo`-derived data that is fully reactive to context changes.
- `useStock` — exposes total/per-warehouse stock figures and `allWarehouse` option list.
- `useSupplier` — exposes `allSupplier` / `allSupplierOptions`. The "any supplier" sentinel value is `"SP-000"` (not `"S-000"`).

### Filter layer — `src/contexts/filterContext.tsx`

Wraps the app inside `DataContextProvider`. Holds all filter state (type chips, status, source/method, warehouse, supplier, search string). Exposes `filterData(data: SubOrderData[])` as a stable `useCallback` — consumers call this to get the filtered slice. `Table.tsx` applies `filterData` before sorting.

### UI components

`src/components/ui/` — low-level primitives (shadcn-style, built on Radix UI + Tailwind).

`src/components/customs/` — feature components:
- `Table.tsx` — sortable, paginated table. Sort → filter → paginate pipeline: `filterData(data)` → sort by `SortKey` → paginate. Page resets via `useEffect([filteredData])` when filters change.
- `manualAllocationDrawer.tsx` — right-side drawer for manual override. Computes `resolvedWsp` via the exported `findBestWsp` helper (same logic as auto-allocation). The `effectiveCredit` and `effectiveStock` add back `currentFill` so the user sees full re-allocation headroom. On Apply: calls `setSubOrderFill(delta)`, `setCustomerCredit(costDelta)`, `setStockLeft(delta)`, `setSubOrderWsp`, `setSubOrderStatus`.
- `FilterSection.tsx` — connects all filter controls to `filterContext`.
- `FilterCommandBox.tsx` — ⌘K command palette with debounced search (300 ms) and autocomplete across order/sub-order/product/customer.

### Provider tree

```
StrictMode
  └── DataContextProvider      (src/contexts/dataContext.tsx)
        └── FilterContextProvider  (src/contexts/filterContext.tsx)
              └── App
```
