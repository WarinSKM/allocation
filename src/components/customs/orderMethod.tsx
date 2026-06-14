import { Kbd } from "../ui/kbd";
import type { AllocationMethod } from "@/constants";

interface OrderMethodProps {
  method: AllocationMethod;
}

export default function OrderMethod({ method }: OrderMethodProps) {
  const label = method === "AUTO" ? "A" : "M";
  return <Kbd>{label}</Kbd>;
}
