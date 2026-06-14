import Chip from "../ui/chip";
import type { VariantProps } from "class-variance-authority";
import type { ChipVariants } from "../ui/chip";

const TYPE_CONFIG: Record<string, { label: string; variant: VariantProps<typeof ChipVariants>["variant"] }> = {
  UNFILLED: { label: "Unfilled", variant: "green" },
  PARTIAL:  { label: "Partial", variant: "yellow" },
  FILLED:   { label: "Filled", variant: "blue" },
};

interface OrderStatusChipProps {
  type: keyof typeof TYPE_CONFIG;
}

export default function OrderStatusChip({ type = "UNFILLED" }: OrderStatusChipProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.UNFILLED;

  return <Chip label={config.label} variant={config.variant} withDot />;
}
