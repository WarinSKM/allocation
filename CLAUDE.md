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

`@/` maps to `src/`. Use it for all internal imports.

## Architecture

### Layer overview

```
src/constants.ts          — shared types & constants (AllocationStatus, AllocationMethod,
                            TYPE_MULTIPLIER, ANY_WAREHOUSE_ID, ANY_SUPPLIER_ID, ALL_FILTER_VALUE)
src/lib/
  allocation.ts           — pure allocation engine (no React)
  filter.ts               — pure filter logic (no React)
  sort.ts                 — pure sort utilities (no React)
  round.ts                — bankersRound (round-half-to-even)
src/data/
  db/                     — static JSON for all entities except suborders
  helper/                 — typed stores + initData aggregate
src/contexts/
  dataContext.tsx          — mutable app state + setters
  filterContext.tsx        — filter state; delegates to src/lib/filter.ts
src/hooks/
  useAllocation.ts        — joins raw data into SubOrderData[], reactive to context
  useManualAllocation.ts  — all logic for the manual allocation drawer
  useStock.ts             — stock metrics
  useWarehouseOptions.ts  — warehouse select option lists
  useSupplierOptions.ts   — supplier select option lists
src/components/customs/   — feature components (Table, ManualAllocationDrawer, FilterSection…)
```

### Data layer — `src/data/`

All reference data (customers, orders, products, suppliers, warehouses, WSPs) are static JSON in `src/data/db/`, imported at build time. **`suborders.json` is the exception** — it is served from `public/data/suborders.json` and fetched at runtime to avoid bundling 1.4 MB into the JS chunk.

`src/data/helper/index.ts` aggregates the static stores into `initData` (a `structuredClone` snapshot). `initData.subOrder` starts as `[]`; the context populates it after fetching.

A WSP (`warehouse_supplier_product`) joins warehouse × supplier × product and carries `stock`. Composite key format: `WH-XXX-SP-XXX-P-XXX`. Sentinels `WH-000` / `SP-000` mean "any warehouse / any supplier — pick highest stock" and are resolved by `findBestWsp` in `src/lib/allocation.ts`.

### State — `src/contexts/dataContext.tsx`

Single React context holding all mutable state. On mount it fetches `suborders.json`, merges it into `initData`, runs `runAutoAllocation`, and writes the result back in one `setData` call.

Setters:
- `setSubOrderFill(id, delta)` — **adds** `delta` to `allocated_qty`; always pass a delta, never an absolute value.
- `setCustomerCredit(id, amount)` — deducts `amount` from credit using `bankersRound`.
- `setStockLeft({ warehouse_id, supplier_id, product_id, amount })` — deducts `amount` from stock.
- `setSubOrderWsp(id, wsp_id)` — updates the WSP and sets `allocation_method: 'MANUAL'`.
- `setSubOrderStatus(id, status)` — sets status to one of `AllocationStatus`.

### Allocation engine — `src/lib/allocation.ts`

Pure functions with zero React dependency — testable in isolation:
- `runAutoAllocation(data)` — allocates across all sub-orders using priority EMERGENCY → OVER_DUE → DAILY, then FIFO by order date. Enforces credit limits. All monetary values rounded with `bankersRound`.
- `findBestWsp(productId, warehouseId, supplierId, stockMap, wsps)` — resolves wildcards to the WSP with highest remaining stock.
- `sortSubOrdersByPriority(subOrders, orders)` — pre-builds an order `Map` for O(1) date lookup during sort.

Price = `product.product_price × TYPE_MULTIPLIER[type]`. Current multipliers: `EMERGENCY: 1.25`, `OVER_DUE: 1.0`, `DAILY: 0.9`.

### Derived data — `src/hooks/useAllocation.ts`

`joinData` flattens the normalised context data into `SubOrderData[]` (all entity fields denormalised). `loading` is derived — `true` while `data.length === 0` (fetch not complete) or all rows are still `PENDING` (allocation not run).

### Filter layer — `src/contexts/filterContext.tsx`

Holds filter state (types set, status, source/method, warehouse, supplier, search). The `filterData` callback delegates entirely to `applyFilters` in `src/lib/filter.ts`. `Table.tsx` calls `filterData(data)` before sorting.

### Manual allocation — `src/hooks/useManualAllocation.ts`

Owns all logic for the right-side drawer: qty state, sourcing state, `resolvedWsp` / `candidates` computation (with current fill added back to the stock map for re-allocation headroom), `maxQty` as `min(request, maxByCredit, availableStock)`, and `handleApply` which calls the five context setters in sequence.

### Provider tree

```
StrictMode
  └── DataContextProvider      (src/contexts/dataContext.tsx)
        └── FilterContextProvider  (src/contexts/filterContext.tsx)
              └── App
```

### Mock data script

`scripts/generate-mock-data.mjs` writes reference data to `src/data/db/` and **suborders to `public/data/suborders.json`** (not `src/data/db/`). Run `npm run mock` after modifying the script.
