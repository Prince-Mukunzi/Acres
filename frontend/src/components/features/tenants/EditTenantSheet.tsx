import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMobile";
import type { Unit } from "@/types/unit";
import { useState, useEffect } from "react";
import { useTenants } from "@/hooks/useApiQueries";
import { useEditTenant } from "@/hooks/useApiMutations";

type TenantData = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  unitName?: string;
  startDate?: string;
  endDate?: string;
  chargingDay?: number;
};

// When used as a controlled sheet (Tenants page): pass open + onOpenChange + tenant
// When used as a self-opening trigger (Properties page): pass unit only
type EditTenantSheetProps =
  | {
      // Controlled mode — Tenants page
      open: boolean;
      onOpenChange: (val: boolean) => void;
      tenant: TenantData;
      unit?: never;
      onSave?: () => void;
    }
  | {
      // Trigger mode — Properties page unit row
      unit: Unit;
      open?: never;
      onOpenChange?: never;
      tenant?: never;
      onSave?: () => void;
    };

export function EditTenantSheet(props: EditTenantSheetProps) {
  const isMobile = useIsMobile();

  const [openStartCalendar, setOpenStartCalendar] = useState(false);
  const [openEndCalendar, setOpenEndCalendar] = useState(false);
  const [openChargingCalendar, setOpenChargingCalendar] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [chargingDate, setChargingDate] = useState<Date | undefined>();
  const editTenantMutation = useEditTenant();
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Determine if we're in controlled mode
  const isControlled = props.open !== undefined;
  
  const { data: cachedTenants = [] } = useTenants();

  // Fetch real tenant data when the sheet is about to open
  const fetchAndPopulate = async () => {
    try {
      if (isControlled && props.tenant) {
        setName(props.tenant.name);
        setPhone(props.tenant.phone || "");
        setEmail(props.tenant.email || "");
        setTenantId(props.tenant.id);
        // Pre-populate chargingDate: build a Date with just the day (month/year don't matter for display)
        if (props.tenant.chargingDay) {
          const d = new Date();
          d.setDate(props.tenant.chargingDay);
          setChargingDate(d);
        } else {
          setChargingDate(undefined);
        }
        if (props.tenant.startDate) setStartDate(new Date(props.tenant.startDate));
        if (props.tenant.endDate) setEndDate(new Date(props.tenant.endDate));
      } else if (!isControlled && props.unit) {
        // Instantly find tenant from global cache via unique ID
        const found = cachedTenants.find((t: any) => t.unitId === props.unit!.id);
        if (found) {
          setName(found.name || "");
          setPhone(found.phone || "");
          setEmail(found.email || "");
          setTenantId(found.id);
          setChargingDate(found.chargingDay ? (() => { const d = new Date(); d.setDate(found.chargingDay); return d; })() : undefined);
          if (found.startDate) setStartDate(new Date(found.startDate));
          if (found.date) setEndDate(new Date(found.date));
        }
      }
    } catch (err) {
      console.error("Failed to populate tenant data:", err);
    }
  };

  // For trigger mode: fetch when rendered (sheet hasn't opened yet, so fetch on mount of trigger)
  useEffect(() => {
    if (!isControlled) return;
    if (props.open) {
      fetchAndPopulate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled ? (props as any).open : null]);

  const handleSave = async () => {
    let idToUpdate = tenantId;

    if (!idToUpdate && !isControlled && props.unit) {
      const found = cachedTenants.find((t: any) => t.unitId === props.unit!.id);
      idToUpdate = found?.id ?? null;
    }

    if (idToUpdate) {
      const nameParts = name.split(" ");
      editTenantMutation.mutate({
        id: idToUpdate,
        data: {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phoneNumber: phone,
          email,
          chargingDay: chargingDate ? chargingDate.getDate() : undefined,
          leaseStartDate: startDate?.toISOString().split("T")[0],
          leaseEndDate: endDate?.toISOString().split("T")[0],
        }
      }, {
        onSuccess: () => {
          props.onSave?.();
        }
      });
    }
  };

  const sheetBody = (
    <SheetContent side={isMobile ? "bottom" : "right"}>
      <SheetHeader>
        <SheetTitle>Edit Tenant</SheetTitle>
        <SheetDescription>
          {isControlled ? props.tenant?.name : props.unit?.tenant}
        </SheetDescription>
      </SheetHeader>
      <FieldGroup className="flex-1 px-4 py-6">
        <Field>
          <Label htmlFor="unit-name">Unit Name</Label>
          <Input
            id="unit-name"
            value={isControlled ? (props.tenant?.unitName ?? "") : (props.unit?.name ?? "")}
            disabled
            className="bg-muted"
          />
        </Field>

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

        <Field>
          <Label>Charging Day</Label>
          <Popover open={openChargingCalendar} onOpenChange={setOpenChargingCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start font-normal w-full">
                {chargingDate
                  ? `Day ${chargingDate.getDate()} of every month`
                  : "Pick charging day"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={chargingDate}
                defaultMonth={chargingDate ?? new Date()}
                captionLayout="dropdown"
                disabled={(date) => date.getDate() > 28}
                onSelect={(date) => {
                  setChargingDate(date);
                  setOpenChargingCalendar(false);
                }}
              />
              <p className="text-xs text-muted-foreground text-center pb-2">
                Days 29–31 are disabled for month compatibility.
              </p>
            </PopoverContent>
          </Popover>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <Label htmlFor="start-date">Lease Start Date</Label>
            <Popover open={openStartCalendar} onOpenChange={setOpenStartCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  {startDate ? startDate.toLocaleDateString() : "Start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
            <Label htmlFor="end-date">Lease End Date</Label>
            <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  {endDate ? endDate.toLocaleDateString() : "End"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
        <Button onClick={handleSave} disabled={editTenantMutation.isPending}>
          {editTenantMutation.isPending ? "Saving..." : "Save"}
        </Button>
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );

  if (isControlled) {
    return (
      <Sheet open={props.open} onOpenChange={props.onOpenChange}>
        {sheetBody}
      </Sheet>
    );
  }

  // Trigger mode: clicking the tenant name link opens the sheet and fetches data
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="p-0" onClick={fetchAndPopulate}>
          {props.unit.tenant}
        </Button>
      </SheetTrigger>
      {sheetBody}
    </Sheet>
  );
}
