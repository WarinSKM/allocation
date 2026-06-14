import { useMemo } from "react";
import "./App.css";
import DashBoardPanel from "./components/customs/DashBoardPanel";
import Table from "./components/customs/Table";
import Summary from "./components/customs/summary";
import { Button } from "./components/ui/button";
import { Typography } from "./components/ui/typography";
import { useAllocation } from "./hooks/useAllocation";
import useStock from "./hooks/useStock";
import { FishIcon } from "lucide-react";
import { useDataContext } from "./contexts/dataContext";
import FilterSection from "./components/customs/FilterSection";


function App() {
  const dataContext = useDataContext()
  const allocateHook = useAllocation();
  const stockHook = useStock();

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
            <Summary title="ALLOCATED" value={`${allocatedVal.toLocaleString()} kg`} description={`of ${totalRequestVal.toLocaleString()} requested`} />
            <Summary title="TOTAL VALUE" value={`$${totalValueAllocated.toLocaleString()}`} description="allocated" />
            <Summary title="STOCK LEFT" value={`${stockHook.totalStockLeft.toLocaleString()} kg`} description="36% of supply" />
            <Summary title="Manual" value={dataContext.manualCount.toLocaleString()} description="overrides" />
          </div>
          {/* Summary End */}
        </div>
        {/* Summary Nav End */}
        <FilterSection />

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
