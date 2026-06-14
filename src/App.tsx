import { useMemo } from "react";
import "./App.css";
import DashBoardPanel from "./components/customs/DashBoardPanel";
import FilterCommandBox from "./components/customs/FilterCommandBox";
import Table from "./components/customs/Table";
import FilterChip from "./components/customs/filterChip";
import Summary from "./components/customs/summary";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Typography } from "./components/ui/typography";
import { useAllocation } from "./hooks/useAllocation";
import useStock from "./hooks/useStock";
import useSupplier from "./hooks/useSupplier";
import { FishIcon } from "lucide-react";

const FilterRadioOption = [
  { value: "all", label: "All" },
  { value: "unfilled", label: "Unfilled" },
  { value: "partial", label: "Partial" },
  { value: "filled", label: "Filled" },
  { value: "exceptions", label: "Exceptions" },
];

const FILTER_SOURCE = [
  { value: "any", label: "Any source" },
  { value: "auto", label: "Auto" },
  { value: "manual", label: "Manual" },
  { value: "unallocated", label: "Unallocated" },
];

function App() {
  const allocateHook = useAllocation();
  const stockHook = useStock();
  const supplierHook = useSupplier()

  const allocatedVal = useMemo(() => {
    return allocateHook.totalAllocated || 0;
  }, [allocateHook.data]);

  const totalRequestVal = useMemo(() => {
    return allocateHook.totalRequest || 0;
  }, [allocateHook.data]);

  const totalValueAllocated = useMemo(() => {
    return allocateHook.totalValueAllocated || 0;
  }, [allocateHook.data]);



  return (
    <>
      <section id="main" className="min-h-screen overflow-hidden">
        {/* Summary Nav Start */}
        <div className="flex items-center justify-between py-4 border-b px-4">
          {/* Logo Start */}
          <div className="flex items-center space-x-3">
            <div><FishIcon className="text-orange-500" /></div>
            <div>
              <Typography variant="h1">Salmon Allocation</Typography>
              <Typography variant="sub">Jun 10, 2026 · 5,200 orders</Typography>
            </div>
          </div>
          {/* Logo End */}
          {/* Summary Start */}
          <div className="flex items-center space-x-3">
            <div className="">
              <Typography variant="h1" as="p">
                50%
              </Typography>
              <Typography variant="sub">FILL RATE</Typography>
            </div>
            <Summary title="ALLOCATED" value={`${allocatedVal.toLocaleString()} kg`} description={`of ${totalRequestVal.toLocaleString()} requested`} />
            <Summary title="TOTAL VALUE" value={`$${totalValueAllocated.toLocaleString()}`} description="allocated" />
            <Summary title="STOCK LEFT" value={`${stockHook.totalStockLeft.toLocaleString()} kg`} description="36% of supply" />
            <Summary title="Credit-blocked" value="1,226" description="orders capped" />
            <Summary title="Manual" value="0" description="overrides" />
            <Button>Auto-allocate</Button>
          </div>
          {/* Summary End */}
        </div>
        {/* Summary Nav End */}
        {/* Fillter Start */}
        <div className="flex items-center space-x-4 py-3 px-4">
          <div>
            <Typography variant="h4">5,200 shown</Typography>
          </div>
          <FilterCommandBox />
          <div className="flex items-center space-x-2">
            <FilterChip label="Emergency" count={409} variant="red" />
            <FilterChip label="Overdue" count={948} variant="amber" />
            <FilterChip label="Daily" count={3843} variant="blue" />
          </div>
          <div>
            <Select defaultValue={FilterRadioOption[0].value}>
              <SelectTrigger>
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FilterRadioOption.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select defaultValue={FILTER_SOURCE[0].value}>
            <SelectTrigger>
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {FILTER_SOURCE.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={stockHook.allWarehouse[0].value}>
            <SelectTrigger>
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {stockHook.allWarehouse.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={supplierHook.allSupplier[0].value}>
            <SelectTrigger>
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {supplierHook.allSupplier.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Fillter End */}

        {/* Table Start */}
        <div className="flex border-t-2">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <Table />
          </div>
          <div className="w-80 shrink-0">
            <DashBoardPanel />
          </div>
        </div>
        {/* Table End */}
      </section>
    </>
  );
}

export default App;
