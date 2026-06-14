import { cn } from "@/utils";
import { useAllocation, type SubOrderData } from "@/hooks/useAllocation";
import { Typography } from "../ui/typography";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useFilterContext } from "@/contexts/filterContext";
import { Pagination, PaginationLink, PaginationPrevious, PaginationContent, PaginationItem, PaginationEllipsis, PaginationNext } from "../ui/pagination";
import ManualAllocationDrawer from "./manualAllocationDrawer";
import Chip from "../ui/chip";
import OrderMethod from "./orderMethod";
import { type SortKey, type SortDir, sortSubOrderData } from "@/lib/sort";

const TABLE_ROW_CLASSNAME = "grid grid-cols-[20px_repeat(13,minmax(0,1fr))] gap-x-2 px-4 py-2";

export default function Table() {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SubOrderData | null>(null);
  const { loading, data } = useAllocation();
  const { filterData } = useFilterContext();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currPage, setCurrPage] = useState(1);
  const [itemPerPage] = useState(20);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === 'desc') {
        setSortKey(null)
      }
      setSortDir((prev) => {
        switch (prev) {
          case 'asc':
            return 'desc'
          case 'desc':
            return null
          default:
            return 'asc'
        }
      });
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrPage(1);
  }

  const filteredData = useMemo(() => filterData(data), [data, filterData]);

  useEffect(() => {
    setCurrPage(1);
  }, [filteredData]);

  const sortedData = useMemo(
    () => sortKey && sortDir ? sortSubOrderData(filteredData, sortKey, sortDir) : filteredData,
    [filteredData, sortKey, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemPerPage));
  const currStart = itemPerPage * (currPage - 1);
  const dataWithCurrPage = sortedData.slice(currStart, currStart + itemPerPage);

  const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currPage) <= 1)
    .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
      if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
      acc.push(page);
      return acc;
    }, []);

  const handleClickRow = (row: SubOrderData) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleDrawerClose = (e: boolean) => {
    setSelectedRow(null)
    setOpen(e)
  }

  return (
    <div>
      <ManualAllocationDrawer open={open} onOpenChange={handleDrawerClose} selectedRow={selectedRow} />
      <div className="max-h-[calc(100vh-220px)] overflow-auto">
        <div className="w-max">
          {/* Table Header Start */}
          <div className={cn(TABLE_ROW_CLASSNAME, "bg-muted")}>
            <TableHead />
            <TableHead sortKey="order" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Order</TableHead>
            <TableHead sortKey="subOrder" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Sub Order</TableHead>
            <TableHead sortKey="type" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Type</TableHead>
            <TableHead sortKey="product" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Item</TableHead>
            <TableHead sortKey="customer" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Customer</TableHead>
            <TableHead sortKey="warehouse" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Warehouse</TableHead>
            <TableHead sortKey="supplier" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Supplier</TableHead>
            <TableHead sortKey="request" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Request</TableHead>
            <TableHead sortKey="fill" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Fill</TableHead>
            <TableHead sortKey="value" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Value</TableHead>
            <TableHead sortKey="availableCredit" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Available Credit</TableHead>
            <TableHead sortKey="createDate" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Create Date</TableHead>
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
          {!loading && dataWithCurrPage.length > 0
            ?
            dataWithCurrPage.map((row, i) => (
              <div key={i} className={cn(TABLE_ROW_CLASSNAME, "cursor-pointer hover:bg-muted")} onClick={() => handleClickRow(row)}>
                <TableCell>
                  <OrderMethod method={row.allocationMethod} />
                </TableCell>
                <TableCell>{row.order}</TableCell>
                <TableCell>{row.subOrder}</TableCell>
                <TableCell>
                  <Chip variant={row.type === "EMERGENCY" ? "red" : row.type === "OVER_DUE" ? "orange" : "green"} label={row.type} withDot></Chip>
                </TableCell>
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
            ))
            : (
              <div className="w-full h-60 flex items-center justify-center">
                <Typography variant="h1" className="text-muted-foreground" as="p">No Data</Typography>
              </div>
            )
          }
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

interface TableHeadProps extends TableCellProps {
  sortKey?: SortKey;
  activeSortKey?: SortKey | null;
  sortDir?: SortDir;
  onSort?: (key: SortKey) => void;
}

function TableHead({ label, children, sortKey, activeSortKey, sortDir, onSort }: TableHeadProps) {
  const isActive = sortKey && activeSortKey === sortKey;
  return (
    <div
      className={sortKey ? "cursor-pointer select-none" : ""}
      onClick={sortKey && onSort ? () => onSort(sortKey) : undefined}
    >
      <Typography variant="h1" as="p" className="flex items-center gap-1">
        {children ?? label}
        {sortKey && (
          <span className={isActive ? "text-foreground" : "text-muted-foreground opacity-30"}>
            {isActive && sortDir === 'desc' ? '↓' : '↑'}
          </span>
        )}
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
