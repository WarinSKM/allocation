import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export type RadioOption = {
  value: string;
  label: string;
};

interface FilterRadioProps {
  options: RadioOption[];
}

export default function FilterRadio({ options }: FilterRadioProps) {
  return (
    <RadioGroup defaultValue={options[0].value} className="bg-muted px-2 py-0.5 border rounded-md flex">
      {options.map((item) => (
        <div className="flex items-center gap-3">
          <RadioGroupItem value={item.value} id={item.value} className="peer hidden" />
          <Label htmlFor={item.value} className="px-3 py-2 text-muted-foreground rounded-md cursor-pointer peer-data-[state=checked]:text-black peer-data-[state=checked]:bg-white">
            {item.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
