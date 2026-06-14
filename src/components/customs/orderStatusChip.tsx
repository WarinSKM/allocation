import Chip from "../ui/chip";
import type { VariantProps } from "class-variance-authority";
import type { ChipVariants } from "../ui/chip";
import type { AllocationStatus } from "@/constants";

const TYPE_CONFIG: Record<AllocationStatus, { label: string; variant: VariantProps<typeof ChipVariants>["variant"] }> = {
  UNFILLED:  { label: "Unfilled", variant: "green" },
  PARTIAL:   { label: "Partial",  variant: "yellow" },
  FULFILLED: { label: "Filled",   variant: "blue" },
  PENDING:   { label: "Pending",  variant: "default" },
};

interface OrderStatusChipProps {
  type: AllocationStatus;
}

export default function OrderStatusChip({ type = "UNFILLED" }: OrderStatusChipProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.UNFILLED;
  return <Chip label={config.label} variant={config.variant} withDot />;
}
