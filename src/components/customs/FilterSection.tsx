import { Typography } from "../ui/typography";
import FilterChip from "./filterChip";
import FilterCommandBox from "./FilterCommandBox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import useSupplierOptions from "@/hooks/useSupplierOptions";
import useWarehouseOptions from "@/hooks/useWarehouseOptions";
import { useFilterContext, type FilterStatus, type FilterSource } from "@/contexts/filterContext";
import { useAllocation } from "@/hooks/useAllocation";
import type { SubOrderType } from "@/data/helper";

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unfilled", label: "Unfilled" },
    { value: "partial", label: "Partial" },
    { value: "filled", label: "Filled" },
    { value: "exceptions", label: "Exceptions" },
];

const SOURCE_OPTIONS: { value: FilterSource; label: string }[] = [
    { value: "any", label: "Any source" },
    { value: "auto", label: "Auto" },
    { value: "manual", label: "Manual" },
];

export default function FilterSection() {
    const { warehouseFilterOptions } = useWarehouseOptions();
    const { supplierFilterOptions } = useSupplierOptions();
    const { data } = useAllocation();
    const { types, status, source, warehouse, supplier, toggleType, setStatus, setSource, setWarehouse, setSupplier, filterData } = useFilterContext();

    const filtered = filterData(data);

    const emergencyCount = data.filter((r) => r.type === 'EMERGENCY').length;
    const overdueCount = data.filter((r) => r.type === 'OVER_DUE').length;
    const dailyCount = data.filter((r) => r.type === 'DAILY').length;

    return (
        <div className="flex items-center space-x-4 py-3 px-4">
            <div>
                <Typography variant="h4">{filtered.length.toLocaleString()} shown</Typography>
            </div>
            <FilterCommandBox />
            <div className="flex items-center space-x-2">
                <FilterChip
                    label="Emergency" count={emergencyCount} variant="red"
                    checked={types.has('EMERGENCY' as SubOrderType)}
                    onCheckedChange={() => toggleType('EMERGENCY' as SubOrderType)}
                />
                <FilterChip
                    label="Overdue" count={overdueCount} variant="amber"
                    checked={types.has('OVER_DUE' as SubOrderType)}
                    onCheckedChange={() => toggleType('OVER_DUE' as SubOrderType)}
                />
                <FilterChip
                    label="Daily" count={dailyCount} variant="blue"
                    checked={types.has('DAILY' as SubOrderType)}
                    onCheckedChange={() => toggleType('DAILY' as SubOrderType)}
                />
            </div>

            <Select value={status} onValueChange={(v) => setStatus(v as FilterStatus)}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={source} onValueChange={(v) => setSource(v as FilterSource)}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {SOURCE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {warehouseFilterOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {supplierFilterOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
