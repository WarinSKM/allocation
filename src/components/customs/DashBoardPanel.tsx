import { Typography } from "../ui/typography";
import { Progress } from "../ui/progress";
import useStock from "@/hooks/useStock";
import { useAllocation } from "@/hooks/useAllocation";
import { useMemo } from "react";
import { cn } from "@/utils";


// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashBoardPanel() {
  const stockHook = useStock()
  const allocationHook = useAllocation()

  const coveragePct = useMemo(() => {
    return Math.min(100, Math.round((stockHook.totalStock / allocationHook.totalRequest) * 100));
  }, [stockHook.totalStock, allocationHook.totalRequest]);

  return (
    <div className="flex flex-col border-l-2 text-sm px-4 pt-3">
      <section className="space-y-2 pb-5">
        <Typography variant="small" as="p" className="font-bold uppercase">
          Supply vs Demand
        </Typography>
        <div className="flex items-center justify-between">
          <Typography variant="muted">Total supply</Typography>
          <Typography variant="p">{fmt(stockHook.totalStock)} kg</Typography>
        </div>
        <div className="flex items-center justify-between">
          <Typography variant="muted">Total requested</Typography>
          <Typography variant="p">{fmt(allocationHook.totalRequest)} kg</Typography>
        </div>
        <Progress value={coveragePct} indicatorClassName={cn(coveragePct >= 100 && "bg-green-400", coveragePct >= 80 && coveragePct < 100 && "bg-yellow-400", coveragePct < 80 && "bg-red-400")} />
        <Typography variant="muted">
          Supply covers <span className={cn("font-semibold", coveragePct >= 100 && "text-green-500", coveragePct >= 80 && coveragePct < 100 && "text-yellow-500", coveragePct < 80 && "text-red-500")}>{coveragePct}%</span> of demand — {coveragePct >= 100 ? "allocation is sufficient." : "allocation is scarce."}
        </Typography>
      </section>

      {/* Stock Remaining */}
      <section className="space-y-2 py-5">
        <div className="flex items-center justify-between">
          <Typography variant="small" as="p" className="font-bold uppercase">
            Stock Remaining
          </Typography>
          <Typography variant="muted">{fmt(stockHook.totalStockLeft)} kg</Typography>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={stockHook.stockLeftPct} indicatorClassName="bg-green-500" />
          <Typography variant="muted" className="shrink-0">
            {stockHook.stockLeftPct}% left
          </Typography>
        </div>
      </section>

      {/* Warehouses */}
      <section className="space-y-3 py-5">
        <Typography variant="small" as="p" className="font-bold uppercase">
          Warehouses
        </Typography>
        {stockHook.eachWarehouseStockLeft.map((w) => (
          <div key={w.warehouse.warehouse_id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Typography variant="muted">{w.warehouse.warehouse_id}</Typography>
                <Typography variant="p">{w.warehouse.warehouse_name}</Typography>
              </div>
              <Typography variant="p">{w.stockLeft.toLocaleString()}</Typography>
            </div>
            <Progress value={(w.stockLeft / stockHook.fullStockPerWarehouse.get(w.warehouse.warehouse_id)) * 100} indicatorClassName="bg-blue-400" />
          </div>
        ))}
      </section>
    </div>
  );
}
