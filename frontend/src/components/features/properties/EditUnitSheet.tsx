import { useState, useEffect } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Unit } from "@/types/unit";
import { useIsMobile } from "@/hooks/useMobile";

interface EditUnitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit | null;
  onSave: (unit: Unit) => void;
}

export function EditUnitSheet({
  open,
  onOpenChange,
  unit,
  onSave,
}: EditUnitSheetProps) {
  const [name, setName] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [status, setStatus] = useState<"Vacant" | "Occupied">("Vacant");
  const [tenant, setTenant] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open && unit) {
      setName(unit.name);
      setRentAmount(unit.rentAmount);
      setStatus(unit.status);
      setTenant(unit.tenant || "");
    }
  }, [open, unit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;

    const updatedUnit: Unit = {
      ...unit,
      name,
      rentAmount,
      status,
      tenant: status === "Occupied" ? tenant : null,
    };

    onSave(updatedUnit);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>Edit Unit</SheetTitle>
            <SheetDescription>
              Update the unit details and tenant information below.
            </SheetDescription>
          </SheetHeader>

          <FieldGroup className="flex-1 px-4 py-6">
            <Field>
              <Label htmlFor="edit-unit-name">Unit Name</Label>
              <Input
                id="edit-unit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="edit-rent-amount">Rent Amount</Label>
              <Input
                id="edit-rent-amount"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: "Vacant" | "Occupied") =>
                  setStatus(value)
                }
              >
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {status === "Occupied" && (
              <Field>
                <Label htmlFor="edit-tenant-name">Tenant Name</Label>
                <Input
                  id="edit-tenant-name"
                  placeholder="Ex: John Doe"
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                  disabled
                />
              </Field>
            )}
          </FieldGroup>

          <SheetFooter className="p-4 border-t">
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
            <SheetClose asChild>
              <Button variant={"outline"} className="w-full">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
