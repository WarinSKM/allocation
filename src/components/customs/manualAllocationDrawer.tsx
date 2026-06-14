import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "../ui/drawer";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Typography } from "../ui/typography";
import { ScrollArea } from "../ui/scroll-area";
import OrderMethod from "./orderMethod";
import OrderStatusChip from "./orderStatusChip";
import TypeChip from "./typeChip";
import type { SubOrderData } from "@/hooks/useAllocation";
import type { SubOrderType } from "@/data/helper";
import type { AllocationMethod } from "@/constants";
import { useManualAllocation } from "@/hooks/useManualAllocation";
import useWarehouseOptions from "@/hooks/useWarehouseOptions";
import useSupplierOptions from "@/hooks/useSupplierOptions";

interface ManualAllocationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow: SubOrderData | null;
}

export default function ManualAllocationDrawer({ onOpenChange, open, selectedRow }: ManualAllocationDrawerProps) {
  const {
    qty, setQty,
    selectedSupplierId, setSelectedSupplierId,
    selectedWarehouseId, setSelectedWarehouseId,
    unitPrice, multiplier, cost, effectiveCredit, maxQty, availableStock,
    showCandidates, candidates, resolvedWsp,
    handleMax, handleClear, handleApply,
  } = useManualAllocation(open, selectedRow, () => onOpenChange(false));

  const { warehouseSourceOptions } = useWarehouseOptions();
  const { supplierSourceOptions }  = useSupplierOptions();

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange} handleOnly={true}>
      <DrawerContent>
        <ScrollArea className="max-h-screen">
          <div>
            <DrawerHeader className="border-b-2">
              <Typography variant="h1" as="p">
                {selectedRow?.subOrder ?? "—"}
              </Typography>
              <div className="flex items-center gap-2">
                <TypeChip type={(selectedRow?.type ?? "DAILY") as SubOrderType} />
                <OrderStatusChip type={selectedRow?.status ?? "PENDING"} />
                <OrderMethod method={(selectedRow?.allocationMethod ?? "AUTO") as AllocationMethod} />
              </div>
            </DrawerHeader>

            <div className="border-b-2 pt-4 pb-2 px-4">
              <Typography variant="h1" as="p">{selectedRow?.customer.customer_name ?? "—"}</Typography>
              <Typography variant="muted">
                {selectedRow?.customer.customer_id} · placed {selectedRow?.createDate}
              </Typography>
            </div>

            <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
              <Typography variant="h1" as="p" className="uppercase">customer credit</Typography>
              <Progress value={effectiveCredit > 0 ? Math.min(100, (cost / effectiveCredit) * 100) : 0} />
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="muted">Available after</Typography>
                  <Typography variant="h1" as="p">
                    {(effectiveCredit - cost).toLocaleString(undefined, { maximumFractionDigits: 2 })} THB
                  </Typography>
                </div>
                <div>
                  <Typography variant="muted">This order</Typography>
                  <Typography variant="h1" as="p">
                    {cost.toLocaleString(undefined, { maximumFractionDigits: 2 })} THB
                  </Typography>
                </div>
              </div>
            </div>

            <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
              <div className="flex items-center justify-between">
                <Typography variant="h1" as="p" className="uppercase">Manual Allocation</Typography>
                <Typography variant="muted">requested {selectedRow?.request.toLocaleString() ?? "0"} kg</Typography>
              </div>
              <div className="flex items-center space-x-2">
                <InputGroup className="h-14">
                  <InputGroupInput
                    type="number"
                    min={0}
                    max={maxQty}
                    value={qty}
                    onChange={(e) => setQty(Math.min(Math.max(0, Number(e.target.value)), maxQty))}
                    className="h-12 text-2xl"
                  />
                  <InputGroupAddon align="inline-end" className="text-2xl">kg</InputGroupAddon>
                </InputGroup>
                <Button onClick={handleMax}>Max</Button>
                <Button onClick={handleClear}>Clear</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <Typography variant="muted">Max allocatable</Typography>
                </div>
                <Typography variant="h4">{maxQty.toLocaleString()} kg</Typography>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <Typography variant="muted">Remaining after</Typography>
                </div>
                <Typography variant="h4">
                  {selectedRow ? (selectedRow.request - qty).toLocaleString() : "0"} kg
                </Typography>
              </div>
            </div>

            <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
              <Typography variant="h1" as="p" className="uppercase">sourcing</Typography>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {supplierSourceOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.value} — {s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {warehouseSourceOptions.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.value} — {w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Typography variant="muted">Product</Typography>
                <Typography variant="h1" as="p">{selectedRow?.product.product_name}</Typography>
                <Typography variant="muted">{selectedRow?.product.product_id}</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="muted">Stock available</Typography>
                <Typography variant="p">{availableStock.toLocaleString()} kg</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="muted">Unit price:</Typography>
                <div className="flex items-center">
                  <Typography variant="p">
                    {unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} THB
                  </Typography>
                  <Typography variant="muted">
                    ({selectedRow?.product.product_price} × {multiplier})
                  </Typography>
                </div>
              </div>
            </div>

            {showCandidates && candidates.length > 0 && (
              <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="h1" as="p" className="uppercase">Draw Plan</Typography>
                  <Typography variant="muted" className="uppercase">
                    {candidates.length} candidate lots
                  </Typography>
                </div>
                {candidates.map(({ wsp, stock, lotId }) => (
                  <div
                    key={wsp.warehouse_supplier_product_id}
                    className={`rounded-md bg-muted px-3 py-2 flex items-center justify-between border-2 ${
                      wsp.warehouse_supplier_product_id === resolvedWsp?.warehouse_supplier_product_id
                        ? "border-orange-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Typography variant="muted">{lotId}</Typography>
                      <span className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">{wsp.supplier_id}</span>
                      <span className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">{wsp.warehouse_id}</span>
                    </div>
                    <Typography variant="h4" as="p">{stock.toLocaleString()} kg</Typography>
                  </div>
                ))}
              </div>
            )}

            <DrawerFooter>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Typography variant="muted">Allocated</Typography>
                  <Typography variant="h1" as="p">
                    {qty.toLocaleString()} kg · {cost.toLocaleString(undefined, { maximumFractionDigits: 2 })} THB
                  </Typography>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleApply}>Apply allocation</Button>
              </div>
            </DrawerFooter>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
