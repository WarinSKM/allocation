import { Kbd } from "../ui/kbd";

interface OrderMethodProps {
  method: "AUTO" | "MANUAL";
}

export default function OrderMethod({ method }: OrderMethodProps) {
  const label = method === "AUTO" ? "A" : "M";
  return <Kbd>{label}</Kbd>;
}
