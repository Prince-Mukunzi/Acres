import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import type { Property } from "@/types/property";

type AddPropertyProps = {
  onAdd: (property: Property) => void;
};

export function AddProperty({ onAdd }: AddPropertyProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("Unit");
  const [units, setUnits] = useState(1);
  const [amount, setAmount] = useState("");

  const unitPreview = Array.from(
    { length: units },
    (_, i) => `${label} ${i + 1}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProperty = {
      id: crypto.randomUUID(),
      name,
      address,
      units,
      tenants: 0,
      tickets: 0,
    };
    onAdd(newProperty);
    setOpen(false);
    // Reset form
    setName("");
    setAddress("");
    setUnits(1);
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Property</Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New property</DialogTitle>
            <DialogDescription>
              Please fill in the property details
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-2" />

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ALU Hostels"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Kimironko, KG 123 st"
                required
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field>
                <Label htmlFor="label">Unit Label</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Unit"
                />
              </Field>

              <Field>
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  type="number"
                  min={1}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  placeholder="5"
                />
              </Field>
              <Field>
                <Label htmlFor="amount">Rent Amount</Label>
                <InputGroup>
                  <InputGroupInput
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500,000"
                  />
                  <InputGroupAddon>
                    <InputGroupText>RWF</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </div>

            {units && (
              <Field>
                <Label htmlFor="preview">Preview</Label>
                <div className="rounded-md border bg-card p-4" id="preview">
                  <div className="flex flex-wrap gap-2">
                    {unitPreview.slice(0, 5).map((unit) => (
                      <Badge key={unit} variant="secondary">
                        {unit}
                      </Badge>
                    ))}
                    {units > 5 && (
                      <Badge variant="outline">+ {units - 5} more</Badge>
                    )}
                  </div>
                </div>
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit">Save Property</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
