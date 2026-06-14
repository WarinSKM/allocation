import { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";
import { SearchIcon, XIcon } from "lucide-react";
import { Kbd } from "../ui/kbd";
import { useFilterContext } from "@/contexts/filterContext";
import { useAllocation } from "@/hooks/useAllocation";

export default function FilterCommandBox() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { search, setSearch } = useFilterContext();
  const { data } = useAllocation();

  useEffect(() => {
    if (open) setInputValue(search);
  }, [open]);

  // Debounce: update context 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const suggestions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return { orders: [], subOrders: [], products: [], customers: [] };

    const seenOrders = new Set<string>();
    const seenSubOrders = new Set<string>();
    const seenProducts = new Set<string>();
    const seenCustomers = new Set<string>();

    const orders: { id: string; label: string }[] = [];
    const subOrders: { id: string; label: string }[] = [];
    const products: { id: string; label: string }[] = [];
    const customers: { id: string; label: string }[] = [];

    for (const row of data) {
      if (!seenOrders.has(row.order) && row.order.toLowerCase().includes(q)) {
        seenOrders.add(row.order);
        orders.push({ id: row.order, label: row.order });
      }
      if (!seenSubOrders.has(row.subOrder) && row.subOrder.toLowerCase().includes(q)) {
        seenSubOrders.add(row.subOrder);
        subOrders.push({ id: row.subOrder, label: row.subOrder });
      }
      const pid = row.product.product_id;
      if (!seenProducts.has(pid) && (pid.toLowerCase().includes(q) || row.product.product_name.toLowerCase().includes(q))) {
        seenProducts.add(pid);
        products.push({ id: pid, label: `${row.product.product_name} · ${pid}` });
      }
      const cid = row.customer.customer_id;
      if (!seenCustomers.has(cid) && (cid.toLowerCase().includes(q) || row.customer.customer_name.toLowerCase().includes(q))) {
        seenCustomers.add(cid);
        customers.push({ id: cid, label: `${row.customer.customer_name} · ${cid}` });
      }
    }

    return {
      orders:    orders.slice(0, 5),
      subOrders: subOrders.slice(0, 5),
      products:  products.slice(0, 5),
      customers: customers.slice(0, 5),
    };
  }, [data, inputValue]);

  const hasResults = Object.values(suggestions).some((arr) => arr.length > 0);

  function handleSelect(value: string) {
    setInputValue(value);
    setSearch(value);
    setOpen(false);
  }

  function handleClear() {
    setInputValue("");
    setSearch("");
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => setOpen(true)} variant="outline" className={`w-fit ${search ? "border-primary" : ""}`}>
        <SearchIcon />
        <span className="max-w-32 truncate">{search || "Search"}</span>
        <Kbd>⌘k</Kbd>
      </Button>
      {search && (
        <Button variant="ghost" size="icon" onClick={handleClear} className="h-7 w-7">
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search order, sub-order, product, customer..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {!hasResults && inputValue.trim() && <CommandEmpty>No results found.</CommandEmpty>}
            {!inputValue.trim() && <CommandEmpty>Start typing to search...</CommandEmpty>}
            {suggestions.orders.length > 0 && (
              <CommandGroup heading="Orders">
                {suggestions.orders.map((s) => (
                  <CommandItem key={s.id} value={s.id} onSelect={() => handleSelect(s.id)}>
                    {s.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {suggestions.subOrders.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Sub-orders">
                  {suggestions.subOrders.map((s) => (
                    <CommandItem key={s.id} value={s.id} onSelect={() => handleSelect(s.id)}>
                      {s.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {suggestions.products.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Products">
                  {suggestions.products.map((s) => (
                    <CommandItem key={s.id} value={s.id} onSelect={() => handleSelect(s.id)}>
                      {s.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {suggestions.customers.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Customers">
                  {suggestions.customers.map((s) => (
                    <CommandItem key={s.id} value={s.id} onSelect={() => handleSelect(s.id)}>
                      {s.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
