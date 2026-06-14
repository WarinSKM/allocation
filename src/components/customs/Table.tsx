import { cn } from "@/utils";
import { useAllocation } from "@/hooks/useAllocation";
import { Typography } from "../ui/typography";
import { useState, type ReactNode } from "react";
import { Pagination, PaginationLink, PaginationPrevious, PaginationContent, PaginationItem, PaginationEllipsis, PaginationNext } from "../ui/pagination";
import ManualAllocationDrawer from "./manualAllocationDrawer";
// import { useEffect, useState } from "react";
// import type { OrderData } from "@/data/helper/getdata";

const TABLE_ROW_CLASSNAME = "grid grid-cols-13 gap-x-2 px-4 py-2";

export default function Table() {
  const [open, setOpen] = useState(false);
  const { loading, data } = useAllocation();
  const [currPage, setCurrPage] = useState(1);
  const [itemPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(data.length / itemPerPage));
  const currStart = itemPerPage * (currPage - 1);
  const dataWithCurrPage = data.slice(currStart, currStart + itemPerPage);

  const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currPage) <= 1)
    .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
      if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
      acc.push(page);
      return acc;
    }, []);

  const handleClickRow = () => {
    setOpen(true);
  };

  return (
    <div className="">
      <ManualAllocationDrawer open={open} onOpenChange={setOpen} />
      <div className="overflow-x-auto">
        <div className="w-max">
          {/* Table Header Start */}
          <div className={cn(TABLE_ROW_CLASSNAME, "bg-muted")}>
            <TableHead>Order</TableHead>
            <TableHead>Sub Order</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Request</TableHead>
            <TableHead>Fill</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Available Credit</TableHead>
            <TableHead>Create Date</TableHead>
            <TableHead>Remark</TableHead>
          </div>
          {/* Table Header End */}
          {/* Table Body Start */}
          {loading && (
            <div className={cn(TABLE_ROW_CLASSNAME, "animate-pulse")}>
              {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className="h-8 rounded bg-muted" />
              ))}
            </div>
          )}
          {!loading &&
            dataWithCurrPage.map((row, i) => (
              <div key={i} className={cn(TABLE_ROW_CLASSNAME, "cursor-pointer hover:bg-muted")} onClick={handleClickRow}>
                <TableCell>{row.order}</TableCell>
                <TableCell>{row.subOrder}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell label={row.product.product_name} id={row.product.product_id}></TableCell>
                <TableCell label={row.customer.customer_name} id={row.customer.customer_id}></TableCell>
                <TableCell label={row.warehouse.warehouse_name} id={row.warehouse.warehouse_id}></TableCell>
                <TableCell label={row.supplier.supplier_name} id={row.supplier.supplier_id}></TableCell>
                <TableCell>{row.request.toLocaleString()} kg</TableCell>
                <TableCell>{row.fill.toLocaleString()} kg</TableCell>
                <TableCell>{row.value.toLocaleString()} THB</TableCell>
                <TableCell>{row.availableCredit.toLocaleString()} THB</TableCell>
                <TableCell>{row.createDate}</TableCell>
                <TableCell>{row.remark}</TableCell>
              </div>
            ))}
          {/* Table Body End */}
        </div>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrPage((p) => Math.max(1, p - 1))} aria-disabled={currPage === 1} className={currPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
          </PaginationItem>

          {pageItems.map((item, idx) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink isActive={item === currPage} onClick={() => setCurrPage(item)} className="cursor-pointer">
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext onClick={() => setCurrPage((p) => Math.min(totalPages, p + 1))} aria-disabled={currPage === totalPages} className={currPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

interface TableCellProps {
  label?: string;
  id?: string;
  children?: ReactNode;
}

function TableHead({ label, children }: TableCellProps) {
  return (
    <div>
      <Typography variant="h1" as="p">
        {children ? children : label}
      </Typography>
    </div>
  );
}

function TableCell({ label, children, id }: TableCellProps) {
  return (
    <div>
      <Typography variant="p" as="p">
        {children ? children : label}
      </Typography>
      <Typography variant="muted">{id}</Typography>
    </div>
  );
}
