import { useDataContext } from "@/contexts/dataContext";
import type { Customer, Data, Product, Supplier, Warehouse, SubOrderType } from "@/data/helper";
import { useEffect, useMemo, useState } from "react";

export type SubOrderData = {
  order: string;
  subOrder: string;
  type: SubOrderType;
  product: Product;
  customer: Customer;
  warehouse: Warehouse;
  supplier: Supplier;
  request: number;
  fill: number;
  value: number;
  availableCredit: number;
  createDate: string;
  remark: string;
  status: string;
  allocationMethod: string;
};

const TYPE_WEIGHT: Record<SubOrderType, number> = {
  EMERGENCY: 0,
  OVER_DUE: 1,
  DAILY: 2,
};

const TYPE_MULTIPLIER: Record<string, number> = {
  EMERGENCY: 1.2,
  OVER_DUE: 1.1,
  DAILY: 1.0,
};

function easyAllocationSortDataFN(data: SubOrderData[]) {
  return [...data].sort((a, b) => TYPE_WEIGHT[a.type] - TYPE_WEIGHT[b.type] || new Date(a.createDate).getTime() - new Date(b.createDate).getTime());
}

function joinData(data: Data) {
  const raw = Array.from(data.subOrder.values()).flatMap((so): SubOrderData[] => {
    const order = data.order.find((item) => item.order_id === so.order_id);
    const wsp = data.wsp.find((item) => item.warehouse_supplier_product_id === so.warehouse_supplier_product_id);
    if (!order || !wsp) return [];

    const customer = data.customer.find((item) => item.customer_id === order.customer_id);
    const warehouse = data.warehouse.find((item) => item.warehouse_id === wsp.warehouse_id);
    const supplier = data.supplier.find((item) => item.supplier_id === wsp.supplier_id);
    const product = data.product.find((item) => item.product_id === wsp.product_id);
    if (!customer || !warehouse || !supplier || !product) return [];

    const unitPrice = product.product_price * (TYPE_MULTIPLIER[so.type] ?? 1.0);

    return [
      {
        order: so.order_id,
        subOrder: so.sub_order_id,
        type: so.type as SubOrderType,
        product,
        customer,
        warehouse,
        supplier,
        request: so.request,
        fill: so.allocated_qty,
        value: so.allocated_qty * unitPrice,
        availableCredit: customer.credit,
        createDate: order.create_date,
        remark: so.remark,
        status: so.status,
        allocationMethod: so.allocation_method,
      },
    ];
  });

  return raw;
}

function getTotalAllocated(data: SubOrderData[]) {
  return data.reduce((prev, curr) => prev + curr.fill, 0);
}

function getTotalRequested(data: SubOrderData[]) {
  return data.reduce((prev, curr) => prev + curr.request, 0);
}

function getTotalValueAllocated(data: SubOrderData[]) {
  return data.reduce((prev, curr) => prev + curr.value, 0);
}

function useAllocation() {
  const dataContext = useDataContext();
  const [loading, setLoading] = useState(true);

  const data = useMemo(() => {
    const temp = joinData(dataContext.data);
    return easyAllocationSortDataFN(temp);
  }, [dataContext.data]);

  const totalRequest = useMemo(() => getTotalRequested(data), [data]);
  const totalAllocated = useMemo(() => getTotalAllocated(data), [data]);
  const totalValueAllocated = useMemo(() => getTotalValueAllocated(data), [data]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return { loading, data, easyAllocationSortDataFN, totalAllocated, totalRequest, totalValueAllocated };
}

export { useAllocation, getTotalAllocated, getTotalRequested, getTotalValueAllocated };
