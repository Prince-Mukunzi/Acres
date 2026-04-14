import { useState, useEffect } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Field, FieldGroup } from "../../ui/field";
import type { Unit } from "@/types/unit";
import type { Tenant } from "@/types/tenant";
import { useIsMobile } from "@/hooks/useMobile";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Calendar } from "../../ui/calendar";
import { useProperties, useUnits } from "@/hooks/useApiQueries";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../ui/select";

interface AssignTenantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit | null;
  onAssign: (tenant: Tenant) => void;
}

export function AssignTenant({
  open,
  onOpenChange,
  unit,
  onAssign,
}: AssignTenantProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [openStartCalendar, setOpenStartCalendar] = useState(false);
  const [openEndCalendar, setOpenEndCalendar] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const isMobile = useIsMobile();

  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const { data: properties = [] } = useProperties(1, "");
  const { data: units = [] } = useUnits(selectedPropertyId);

  const activeUnit = unit || units.find((u) => u.id === selectedUnitId) || null;

  useEffect(() => {
    if (open) {
      setName("");
      setPhone("");
      setEmail("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedUnit = activeUnit;
    if (!resolvedUnit) return;

    const resolvedPropertyId = selectedPropertyId || unit?.propertyId || "";

    onAssign({
      tenantData: {
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        phoneNumber: phone,
        email,
        unitID: resolvedUnit.id,
        leaseStartDate: startDate?.toISOString().split("T")[0],
        leaseEndDate: endDate?.toISOString().split("T")[0],
        status: "Paid",
      },
      unitData: {
        propertyId: resolvedPropertyId,
        unitName: resolvedUnit.name,
        rentAmount: resolvedUnit.rentAmount,
        unitStatus: "Occupied",
      },
    } as any);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>Assign Tenant</SheetTitle>
            <SheetDescription>
              Fill out the details below to assign a new tenant to this unit.
            </SheetDescription>
          </SheetHeader>

          <FieldGroup className="flex-1 px-4 py-6">
            {!unit ? (
              <div className="grid grid-cols-1 gap-4 mb-4">
                <Field>
                  <Label>Property</Label>
                   <Select value={selectedPropertyId} onValueChange={(val) => { setSelectedPropertyId(val); setSelectedUnitId(""); }}>
                     <SelectTrigger><SelectValue placeholder="Select property..." /></SelectTrigger>
                     <SelectContent>
                       {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </Field>
                <Field>
                  <Label>Unit</Label>
                   <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={!selectedPropertyId}>
                     <SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger>
                     <SelectContent>
                       {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </Field>
              </div>
            ) : (
              <Field>
                <Label htmlFor="unit-name">Unit Name</Label>
                <Input
                  id="unit-name"
                  value={unit.name}
                  disabled
                  className="bg-muted mb-4"
                />
              </Field>
            )}

            <Field>
              <Label htmlFor="tenant-name">Tenant Name</Label>
              <Input
                id="tenant-name"
                placeholder="Ex: John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Ex: +250 788 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="date">Lease Start Date</Label>
                <Popover
                  open={openStartCalendar}
                  onOpenChange={setOpenStartCalendar}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start font-normal"
                    >
                      {startDate ? startDate.toLocaleDateString() : "Start"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={startDate}
                      defaultMonth={startDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setStartDate(date);
                        setOpenStartCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <Label htmlFor="date">Lease End Date</Label>
                <Popover
                  open={openEndCalendar}
                  onOpenChange={setOpenEndCalendar}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start font-normal"
                    >
                      {endDate ? endDate.toLocaleDateString() : "End"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={endDate}
                      defaultMonth={endDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setEndDate(date);
                        setOpenEndCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </FieldGroup>

          <SheetFooter>
            <Button type="submit">Assign Tenant</Button>
            <SheetClose asChild>
              <Button variant={"outline"}>Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
