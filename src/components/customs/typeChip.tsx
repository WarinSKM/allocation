import Chip from "../ui/chip";
import type { VariantProps } from "class-variance-authority";
import type { ChipVariants } from "../ui/chip";

const TYPE_CONFIG: Record<string, { label: string; variant: VariantProps<typeof ChipVariants>["variant"] }> = {
  EMERGENCY: { label: "Emergency", variant: "red" },
  OVER_DUE:  { label: "Overdue",   variant: "yellow" },
  DAILY:     { label: "Daily",     variant: "blue" },
};

interface TypeChipProps {
  type: keyof typeof TYPE_CONFIG;
}

export default function TypeChip({ type = "DAILY" }: TypeChipProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.DAILY;

  return <Chip label={config.label} variant={config.variant} withDot />;
}
