import { cva, type VariantProps } from "class-variance-authority";
import { Typography } from "./typography";
import { cn } from "@/utils";

export const ChipVariants = cva("px-2 py-0.5 rounded-full w-fit flex items-center gap-x-1", {
  variants: {
    variant: {
      red: "text-red-500 bg-red-100",
      yellow: "text-yellow-500 bg-yellow-100",
      blue: "text-blue-500 bg-blue-100",
      green: "text-green-500 bg-green-100",
      purple: "text-purple-500 bg-purple-100",
      orange: "text-orange-500 bg-orange-100",
    },
  },
  defaultVariants: {
    variant: "red",
  },
});

export const TextVariants = cva("", {
  variants: {
    variant: {
      red: "text-red-500",
      yellow: "text-yellow-500",
      blue: "text-blue-500",
      green: "text-green-500",
      purple: "text-purple-500",
      orange: "text-orange-500",
    },
  },
  defaultVariants: {
    variant: "red",
  },
});

const DotVariants = cva("w-2 h-2 rounded-full", {
  variants: {
    variant: {
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
    },
  },
});

type ChipProps = {
  label: string;
  withDot?: boolean;
} & VariantProps<typeof ChipVariants>;

export default function Chip({ label, withDot = false, variant }: ChipProps) {
  return (
    <div className={cn(ChipVariants({ variant }))}>
      {/* dot */}
      {withDot && <div className={cn(DotVariants({ variant }))}></div>}
      <Typography variant="p" className={cn(TextVariants({ variant }))}>
        {label}
      </Typography>
    </div>
  );
}
