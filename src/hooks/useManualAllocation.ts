import { useEffect, useMemo, useState } from "react";
import type { SubOrderData } from "@/hooks/useAllocation";
import type { AllocationStatus } from "@/constants";
import { TYPE_MULTIPLIER, ANY_WAREHOUSE_ID, ANY_SUPPLIER_ID, ALL_FILTER_VALUE } from "@/constants";
import { bankersRound } from "@/lib/round";
import { useDataContext } from "@/contexts/dataContext";
import type { WarehouseSupplierProduct } from "@/data/helper";

export type Candidate = {
  wsp: WarehouseSupplierProduct;
  stock: number;
  lotId: string;
};

export type UseManualAllocationReturn = {
  qty: number;
  setQty: (qty: number) => void;
  selectedSupplierId: string;
  setSelectedSupplierId: (id: string) => void;
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  unitPrice: number;
  multiplier: number;
  cost: number;
  effectiveCredit: number;
  maxQty: number;
  availableStock: number;
  showCandidates: boolean;
  candidates: Candidate[];
  resolvedWsp: WarehouseSupplierProduct | undefined;
  handleMax: () => void;
  handleClear: () => void;
  handleApply: () => void;
};

export function useManualAllocation(
  open: boolean,
  selectedRow: SubOrderData | null,
  onClose: () => void,
): UseManualAllocationReturn {
  const { setSubOrderFill, setCustomerCredit, setStockLeft, setSubOrderWsp, setSubOrderStatus, data, increaseManualCount } = useDataContext();

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

  const currentFill = selectedRow?.fill ?? 0;
  const multiplier = TYPE_MULTIPLIER[selectedRow?.type ?? "DAILY"] ?? 1.0;
  const unitPrice = bankersRound((selectedRow?.product.product_price ?? 0) * multiplier);
  const cost = bankersRound(qty * unitPrice);
  const effectiveCredit = bankersRound((selectedRow?.availableCredit ?? 0) + currentFill * unitPrice);
  const maxByCredit = unitPrice > 0 ? Math.floor(effectiveCredit / unitPrice) : 0;

  const isAnyWarehouse = selectedWarehouseId === ANY_WAREHOUSE_ID || selectedWarehouseId === ALL_FILTER_VALUE;
  const isAnySupplier  = selectedSupplierId  === ANY_SUPPLIER_ID  || selectedSupplierId  === ALL_FILTER_VALUE;
  const showCandidates = isAnyWarehouse || isAnySupplier;

  const { resolvedWsp, availableStock, candidates } = useMemo(() => {
    if (!selectedRow) return { resolvedWsp: undefined, availableStock: 0, candidates: [] as Candidate[] };

    const stockMap = new Map(data.wsp.map((w) => [w.warehouse_supplier_product_id, w.stock]));
    const originalWsp = data.wsp.find(
      (w) =>
        w.warehouse_id === selectedRow.warehouse.warehouse_id &&
        w.supplier_id  === selectedRow.supplier.supplier_id &&
        w.product_id   === selectedRow.product.product_id,
    );
    if (originalWsp && currentFill > 0) {
      stockMap.set(
        originalWsp.warehouse_supplier_product_id,
        (stockMap.get(originalWsp.warehouse_supplier_product_id) ?? 0) + currentFill,
      );
    }

    const whId  = selectedWarehouseId === ALL_FILTER_VALUE ? ANY_WAREHOUSE_ID : selectedWarehouseId;
    const spId  = selectedSupplierId  === ALL_FILTER_VALUE ? ANY_SUPPLIER_ID  : selectedSupplierId;
    const anyWh = whId === ANY_WAREHOUSE_ID;
    const anySp = spId === ANY_SUPPLIER_ID;

    const sorted: Candidate[] = data.wsp
      .filter((w) => {
        if (w.product_id !== selectedRow.product.product_id) return false;
        if (!anyWh && w.warehouse_id !== whId) return false;
        if (!anySp && w.supplier_id  !== spId) return false;
        return (stockMap.get(w.warehouse_supplier_product_id) ?? 0) > 0;
      })
      .map((w) => ({
        wsp:   w,
        stock: stockMap.get(w.warehouse_supplier_product_id) ?? 0,
        lotId: `LOT-${(data.wsp.indexOf(w) + 1).toString().padStart(4, "0")}`,
      }))
      .sort((a, b) => b.stock - a.stock);

    const best = sorted[0]?.wsp;
    return {
      resolvedWsp:    best,
      availableStock: best ? (stockMap.get(best.warehouse_supplier_product_id) ?? 0) : 0,
      candidates:     sorted,
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
    const delta     = qty - selectedRow.fill;
    const costDelta = bankersRound(delta * unitPrice);
    setSubOrderFill(selectedRow.subOrder, delta);
    setCustomerCredit(selectedRow.customer.customer_id, costDelta);
    setStockLeft({
      warehouse_id: resolvedWsp.warehouse_id,
      supplier_id:  resolvedWsp.supplier_id,
      product_id:   resolvedWsp.product_id,
      amount:       delta,
    });
    setSubOrderWsp(selectedRow.subOrder, resolvedWsp.warehouse_supplier_product_id);
    const newStatus: AllocationStatus = qty <= 0 ? 'UNFILLED' : qty >= selectedRow.request ? 'FULFILLED' : 'PARTIAL';
    setSubOrderStatus(selectedRow.subOrder, newStatus);
    increaseManualCount();
    onClose();
  }

  return {
    qty, setQty,
    selectedSupplierId, setSelectedSupplierId,
    selectedWarehouseId, setSelectedWarehouseId,
    unitPrice, multiplier, cost, effectiveCredit, maxQty, availableStock,
    showCandidates, candidates, resolvedWsp,
    handleMax, handleClear, handleApply,
  };
}
