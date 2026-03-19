import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Property } from "@/types/property";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Unit } from "@/types/unit";

type AddUnitDialogProps = {
  property: Property;
  onAddUnits: (units: Unit[]) => void;
};
export function AddUnitDialog({ property, onAddUnits }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  // Single state
  const [singleLabel, setSingleLabel] = useState("");
  const [singleAmount, setSingleAmount] = useState("");

  // Bulk state
  const [bulkLabel, setBulkLabel] = useState("Unit");
  const [bulkUnits, setBulkUnits] = useState(1);
  const [bulkAmount, setBulkAmount] = useState("");

  const unitPreview = Array.from(
    { length: bulkUnits },
    (_, i) => `${bulkLabel} ${i + 1}`
  );

  const handleSave = () => {
    const newUnits: Unit[] = [];

    if (activeTab === "single") {
      if (!singleLabel) return;
      newUnits.push({
        id: crypto.randomUUID(),
        name: singleLabel,
        rentAmount: singleAmount,
        status: "Vacant",
        tenant: null,
      });
    } else {
      if (!bulkLabel || bulkUnits < 1) return;
      for (let i = 0; i < bulkUnits; i++) {
        newUnits.push({
          id: crypto.randomUUID(),
          name: `${bulkLabel} ${i + 1}`,
          rentAmount: bulkAmount,
          status: "Vacant",
          tenant: null,
        });
      }
    }

    onAddUnits(newUnits);
    setOpen(false);
    
    // reset form
    setSingleLabel("");
    setSingleAmount("");
    setBulkLabel("Unit");
    setBulkUnits(1);
    setBulkAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add Units
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Units to {property.name}</DialogTitle>
          <DialogDescription>
            <strong>Note:</strong> You can bulk generate units
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant={"default"} className="w-full justify-center">
            <TabsTrigger value="single">Single Generate</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Generate</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <form>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="single-unit">Unit Label</FieldLabel>
                    <Input 
                      id="single-unit" 
                      type="text" 
                      placeholder="Unit 1" 
                      value={singleLabel}
                      onChange={(e) => setSingleLabel(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="single-amount">Rent Amount</FieldLabel>
                    <InputGroup>
                      <InputGroupInput 
                        id="single-amount" 
                        placeholder="500,000" 
                        value={singleAmount}
                        onChange={(e) => setSingleAmount(e.target.value)}
                      />
                      <InputGroupAddon>
                        <InputGroupText>RWF</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </form>
          </TabsContent>
          <TabsContent value="bulk">
            <form>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="bulk-unit">Unit Label</FieldLabel>
                    <Input
                      id="bulk-unit"
                      type="text"
                      value={bulkLabel}
                      onChange={(e) => setBulkLabel(e.target.value)}
                      placeholder="Unit 1"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="bulk-units">Units</FieldLabel>
                      <Input
                        id="bulk-units"
                        type="number"
                        min={1}
                        onChange={(e) => setBulkUnits(Number(e.target.value))}
                        value={bulkUnits}
                        placeholder="5"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="bulk-amount">Rent Amount</FieldLabel>
                      <InputGroup>
                        <InputGroupInput 
                          id="bulk-amount" 
                          placeholder="500,000" 
                          value={bulkAmount}
                          onChange={(e) => setBulkAmount(e.target.value)}
                        />
                        <InputGroupAddon>
                          <InputGroupText>RWF</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  </div>
                  {bulkUnits > 0 && (
                    <Field>
                      <FieldLabel htmlFor="preview">Preview</FieldLabel>
                      <div
                        className="rounded-md border bg-card p-4"
                        id="preview"
                      >
                        <div className="flex flex-wrap gap-2">
                          {unitPreview.slice(0, 5).map((unit) => (
                            <Badge key={unit} variant="secondary">
                              {unit}
                            </Badge>
                          ))}
                          {bulkUnits > 5 && (
                            <Badge variant="outline">+ {bulkUnits - 5} more</Badge>
                          )}
                        </div>
                      </div>
                    </Field>
                  )}
                </FieldGroup>
              </FieldSet>
            </form>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
