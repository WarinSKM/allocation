import { Button } from "../ui/button";
import { Drawer,  DrawerContent, DrawerFooter, DrawerHeader } from "../ui/drawer";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Typography } from "../ui/typography";
import OrderMethod from "./orderMethod";
import OrderStatusChip from "./orderStatusChip";
import TypeChip from "./typeChip";

interface ManualAllocationDrawerProps {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
}

export default function ManualAllocationDrawer({ onOpenChange, open }: ManualAllocationDrawerProps) {
  const handleCloseDrawer = () => {
    onOpenChange(false);
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange} handleOnly={true} >
      <DrawerContent>
        <DrawerHeader className="border-b-2">
          <Typography variant="h1" as="p">
            ORD-0001-001
          </Typography>
          <div className="flex items-center gap-2">
            <TypeChip type="EMERGENCY" />
            <OrderStatusChip type="FILLED" />
            <OrderMethod method="AUTO" />
          </div>
        </DrawerHeader>
        <div className="border-b-2 pt-4 pb-2 px-4">
          <Typography variant="h1" as="p">
            Aurora Imports & Sons
          </Typography>
          <Typography variant="muted">CU-1104 · placed Jun 5, 2026</Typography>
        </div>
        <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
          <Typography variant="h1" as="p" className="uppercase">
            customer credit
          </Typography>
          <Progress value={50} />
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="muted">Available</Typography>
              <Typography variant="h1" as="p">
                $1,456.78
              </Typography>
            </div>
            <div>
              <Typography variant="muted">This order</Typography>
              <Typography variant="h1" as="p">
                $0.00
              </Typography>
            </div>
          </div>
        </div>
        <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="h1" as="p" className="uppercase">
              mannual Allocation
            </Typography>
            <Typography variant="muted">requested 68.90 kg</Typography>
          </div>
          <div className="flex items-center space-x-2">
            <InputGroup className="h-14">
              <InputGroupInput type="number" value={0} className="h-12 text-2xl"/>
              <InputGroupAddon align="inline-end" className="text-2xl">kg</InputGroupAddon>
            </InputGroup>
            <Button>Max</Button>
            <Button>Clear</Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Typography variant="muted">Max available now</Typography>
            </div>
            <Typography variant="h4">0.00 kg</Typography>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Typography variant="muted">Max available now</Typography>
            </div>
            <Typography variant="h4">0.00 kg</Typography>
          </div>
        </div>
        <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
          <Typography variant="h1" as="p" className="uppercase">
            sourcing
          </Typography>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select defaultValue="SP-000">
              <SelectTrigger>
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SP-000">SP-000 - Temp Salmon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Warehouse</Label>
            <Select defaultValue="WH-000">
              <SelectTrigger>
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WH-000">WH-000 - Temp Any (highest stock)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Typography variant="muted">Unit price</Typography>
            <Typography variant="h1" as="p">
              $12/unit
            </Typography>
            <Typography variant="muted">(Emergency x 1.20)</Typography>
          </div>
        </div>
        <div className="border-b-2 pt-4 pb-2 px-4 space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="h1" as="p" className="uppercase">
              draw plan
            </Typography>
            <Typography variant="muted" className="uppercase">
              3 candidate lots
            </Typography>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Typography variant="muted">LOT-0015</Typography>
              <Typography variant="muted">SP-004</Typography>
              <Typography variant="muted">WH-006</Typography>
            </div>
            <Typography variant="h4" as="p">
              81,490 kg
            </Typography>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Typography variant="muted">LOT-0015</Typography>
              <Typography variant="muted">SP-004</Typography>
              <Typography variant="muted">WH-006</Typography>
            </div>
            <Typography variant="h4" as="p">
              81,490 kg
            </Typography>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Typography variant="muted">LOT-0015</Typography>
              <Typography variant="muted">SP-004</Typography>
              <Typography variant="muted">WH-006</Typography>
            </div>
            <Typography variant="h4" as="p">
              81,490 kg
            </Typography>
          </div>
        </div>
        <DrawerFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Typography variant="muted">Allocated</Typography>
              <Typography variant="h1" as="p">
                248.99 kg · $3,123.23
              </Typography>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button onClick={handleCloseDrawer}>Apply allocation</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
