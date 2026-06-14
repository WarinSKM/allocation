import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "../ui/drawer";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Typography } from "../ui/typography";
import OrderMethod from "./orderMethod";
import OrderStatusChip from "./orderStatusChip";
import TypeChip from "./typeChip";
import type { SubOrderData } from "@/hooks/useAllocation";
import type { SubOrderType } from "@/data/helper";
import { useDataContext } from "@/contexts/dataContext";
import { TYPE_MULTIPLIER, ANY_WAREHOUSE_ID, ANY_SUPPLIER_ID, ALL_FILTER_VALUE, type AllocationMethod } from "@/constants";
import { bankersRound } from "@/lib/round";
import useWarehouseOptions from "@/hooks/useWarehouseOptions";
import useSupplierOptions from "@/hooks/useSupplierOptions";
import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

interface ManualAllocationDrawerProps {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
  selectedRow: SubOrderData | null;
}

export default function ManualAllocationDrawer({ onOpenChange, open, selectedRow }: ManualAllocationDrawerProps) {
  const { setSubOrderFill, setCustomerCredit, setStockLeft, setSubOrderWsp, setSubOrderStatus, data, increaseManualCount } = useDataContext();

  const { warehouseSourceOptions } = useWarehouseOptions();
  const { supplierSourceOptions } = useSupplierOptions();

  const [qty, setQty] = useState(0);
  const [selectedSupplierId, setSelectedSupplierId] = useState(ANY_SUPPLIER_ID);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(ANY_WAREHOUSE_ID);

  useEffect(() => {
    if (open && selectedRow) {
      setQty(selectedRow.fill ?? 0);
      setSelectedSupplierId(selectedRow.supplier.supplier_id ?? ANY_SUPPLIER_ID);
      setSelectedWarehouseId(selectedRow.warehouse.warehouse_id ?? ANY_WAREHOUSE_ID);
    } else if (!open) {
      setQty(0);
      setSelectedSupplierId(ANY_SUPPLIER_ID);
      setSelectedWarehouseId(ANY_WAREHOUSE_ID);
    }
  }, [open, selectedRow]);

  const multiplier = TYPE_MULTIPLIER[selectedRow?.type ?? "DAILY"] ?? 1.0;
  const unitPrice = bankersRound((selectedRow?.product.product_price ?? 0) * multiplier);
  const cost = bankersRound(qty * unitPrice);
  const currentFill = selectedRow?.fill ?? 0;

  // Add back what's already allocated so re-allocation sees full headroom
  const effectiveCredit = bankersRound((selectedRow?.availableCredit ?? 0) + currentFill * unitPrice);
  const maxByCredit = unitPrice > 0 ? Math.floor(effectiveCredit / unitPrice) : 0;

  const isAnyWarehouse = selectedWarehouseId === ANY_WAREHOUSE_ID || selectedWarehouseId === ALL_FILTER_VALUE;
  const isAnySupplier = selectedSupplierId === ANY_SUPPLIER_ID || selectedSupplierId === ALL_FILTER_VALUE;
  const showCandidates = isAnyWarehouse || isAnySupplier;

  const { resolvedWsp, availableStock, candidates } = useMemo(() => {
    if (!selectedRow) return { resolvedWsp: undefined, availableStock: 0, candidates: [] };

    // Build stock map and add back current fill to the original WSP
    const stockMap = new Map(data.wsp.map((w) => [w.warehouse_supplier_product_id, w.stock]));
    const originalWsp = data.wsp.find(
      (w) =>
        w.warehouse_id === selectedRow.warehouse.warehouse_id &&
        w.supplier_id === selectedRow.supplier.supplier_id &&
        w.product_id === selectedRow.product.product_id
    );
    if (originalWsp && currentFill > 0) {
      stockMap.set(originalWsp.warehouse_supplier_product_id, (stockMap.get(originalWsp.warehouse_supplier_product_id) ?? 0) + currentFill);
    }

    const whId = selectedWarehouseId === ALL_FILTER_VALUE ? ANY_WAREHOUSE_ID : selectedWarehouseId;
    const spId = selectedSupplierId === ALL_FILTER_VALUE ? ANY_SUPPLIER_ID : selectedSupplierId;
    const anyWh = whId === ANY_WAREHOUSE_ID;
    const anySp = spId === ANY_SUPPLIER_ID;

    const sorted = data.wsp
      .filter((w) => {
        if (w.product_id !== selectedRow.product.product_id) return false;
        if (!anyWh && w.warehouse_id !== whId) return false;
        if (!anySp && w.supplier_id !== spId) return false;
        return (stockMap.get(w.warehouse_supplier_product_id) ?? 0) > 0;
      })
      .map((w, _, arr) => ({ wsp: w, stock: stockMap.get(w.warehouse_supplier_product_id) ?? 0, lotId: `LOT-${(data.wsp.indexOf(w) + 1).toString().padStart(4, "0")}` }))
      .sort((a, b) => b.stock - a.stock);

    const best = sorted[0]?.wsp;
    return {
      resolvedWsp: best,
      availableStock: best ? (stockMap.get(best.warehouse_supplier_product_id) ?? 0) : 0,
      candidates: sorted,
    };
  }, [data.wsp, selectedRow, selectedWarehouseId, selectedSupplierId, currentFill]);

  const maxQty = Math.min(selectedRow?.request ?? 0, maxByCredit, availableStock);

  useEffect(() => {
    setQty((prev) => Math.min(prev, maxQty));
  }, [selectedWarehouseId, selectedSupplierId]);

  function handleMax() {
    setQty(maxQty);
  }

  function handleClear() {
    setQty(0);
  }

  function handleApply() {
    if (!selectedRow || !resolvedWsp) return;
    const delta = qty - selectedRow.fill;
    const costDelta = bankersRound(delta * unitPrice);
    setSubOrderFill(selectedRow.subOrder, delta);
    setCustomerCredit(selectedRow.customer.customer_id, costDelta);
    setStockLeft({
      warehouse_id: resolvedWsp.warehouse_id,
      supplier_id: resolvedWsp.supplier_id,
      product_id: resolvedWsp.product_id,
      amount: delta,
    });
    setSubOrderWsp(selectedRow.subOrder, resolvedWsp.warehouse_supplier_product_id);
    const newStatus = qty <= 0 ? 'UNFILLED' : qty >= selectedRow.request ? 'FULFILLED' : 'PARTIAL';
    setSubOrderStatus(selectedRow.subOrder, newStatus);
    increaseManualCount();
    onOpenChange(false);
  }

  const handleCloseDrawer = () => {
    onOpenChange(false);
  };

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
              <Typography variant="h1" as="p">
                {selectedRow?.customer.customer_name ?? "—"}
              </Typography>
              <Typography variant="muted">
                {selectedRow?.customer.customer_id} · placed {selectedRow?.createDate}
              </Typography>
            </div>

            <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
              <Typography variant="h1" as="p" className="uppercase">
                customer credit
              </Typography>
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
                <Typography variant="h1" as="p" className="uppercase">
                  Manual Allocation
                </Typography>
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
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Typography variant="muted">Max allocatable</Typography>
                </div>
                <Typography variant="h4">{maxQty.toLocaleString()} kg</Typography>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <Typography variant="muted">Remaining after</Typography>
                </div>
                <Typography variant="h4">
                  {selectedRow ? (selectedRow.request - qty).toLocaleString() : "0"} kg
                </Typography>
              </div>
            </div>

            <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
              <Typography variant="h1" as="p" className="uppercase">
                sourcing
              </Typography>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierSourceOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.value} — {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseSourceOptions.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.value} — {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Typography variant="muted">Product</Typography>
                <Typography variant="h1" as="p">
                  {selectedRow?.product.product_name}
                </Typography>
                <Typography variant="muted">{selectedRow?.product.product_id}</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="muted">Stock available</Typography>
                <Typography variant="p">{availableStock.toLocaleString()} kg</Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="muted">Unit price:</Typography>
                <div className="flex items-center">
                  <Typography variant="p">{unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} THB</Typography>
                  <Typography variant="muted">({selectedRow?.product.product_price} × {multiplier})</Typography>
                </div>
              </div>
            </div>

            {showCandidates && candidates.length > 0 && (
              <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="h1" as="p" className="uppercase">
                    Draw Plan
                  </Typography>
                  <Typography variant="muted" className="uppercase">
                    {candidates.length} candidate lots
                  </Typography>
                </div>
                {candidates.map(({ wsp, stock, lotId }) => (
                  <div key={wsp.warehouse_supplier_product_id} className={`rounded-md bg-muted px-3 py-2 flex items-center justify-between border-2 ${wsp.warehouse_supplier_product_id === resolvedWsp?.warehouse_supplier_product_id ? "border-orange-500" : "border-transparent"}`}>
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
                <Button onClick={handleCloseDrawer}>Cancel</Button>
                <Button onClick={handleApply}>Apply allocation</Button>
              </div>
            </DrawerFooter>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
