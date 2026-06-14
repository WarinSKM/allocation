import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/utils";
import { Typography } from "../ui/typography";

const DEFAULT_VARIANTS = "blue";

const filterChipVariants = cva("inline-flex cursor-pointer select-none items-center gap-2 rounded-md border px-3 py-1.5 transition-colors", {
  variants: {
    variant: {
      red: "bg-red-50 border-red-200",
      amber: "bg-amber-50 border-amber-200",
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      purple: "bg-purple-50 border-purple-200",
    },
  },
  defaultVariants: {
    variant: DEFAULT_VARIANTS,
  },
});

const dotVariants = cva("size-2 shrink-0 rounded-full transition-colors", {
  variants: {
    variant: {
      red: "bg-red-500",
      amber: "bg-amber-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
    },
  },
  defaultVariants: {
    variant: DEFAULT_VARIANTS,
  },
});

const labelVariants = cva("transition-colors", {
  variants: {
    variant: {
      red: "text-red-500",
      amber: "text-amber-600",
      blue: "text-blue-500",
      green: "text-green-600",
      purple: "text-purple-600",
    },
  },
  defaultVariants: {
    variant: DEFAULT_VARIANTS,
  },
});

type FilterChipProps = {
  label: string;
  count: number;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & VariantProps<typeof filterChipVariants>;

function FilterChip({ label, count, variant, checked, defaultChecked = true, onCheckedChange }: FilterChipProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isChecked = checked ?? internal;

  return (
    <label className={filterChipVariants({ variant })}>
      <Checkbox
        className="hidden"
        checked={isChecked}
        onCheckedChange={(val) => {
          setInternal(!!val);
          onCheckedChange?.(!!val);
        }}
      />
      <span className={cn(isChecked ? dotVariants({ variant }) : "bg-muted-foreground/40 size-2 shrink-0 rounded-full")} />
      <Typography variant="p" className={cn(isChecked ? labelVariants({ variant }) : "text-muted-foreground/60")}>
        {label}
      </Typography>
      <Typography className="text-sm text-muted-foreground">{count}</Typography>
    </label>
  );
}

export default FilterChip;
export type { FilterChipProps };
