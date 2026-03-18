import {
  MoreHorizontalIcon,
  Pencil,
  QrCodeIcon,
  Trash2Icon,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { PropertyList } from "@/components/features/properties/PropertyCard";
import { properties } from "@/lib/seed/properties";
import { units as initialUnits } from "@/lib/seed/units";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddProperty } from "@/components/features/properties/PropertyForm";
import { AssignTenant } from "@/components/features/tenants/AssignTenantSheet";
import { EditUnitSheet } from "@/components/features/properties/EditUnitSheet";
import { TicketQrDialog } from "@/components/features/tickets/TicketQrDialog";
import type { Unit } from "@/types/unit";
import type { Tenant } from "@/types/tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import type { Property } from "@/types/property";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Properties() {
  const { isMobile } = useSidebar();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [propertiesList, setPropertiesList] = useState<Property[]>(properties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    properties[0] || null
  );
  const [unitsList, setUnitsList] = useState<Unit[]>(initialUnits);

  const [isAssignSheetOpen, setIsAssignSheetOpen] = useState(false);
  const [selectedUnitForAssignment, setSelectedUnitForAssignment] =
    useState<Unit | null>(null);

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedUnitForEdit, setSelectedUnitForEdit] = useState<Unit | null>(
    null
  );

  const [isDeleteUnitDialogOpen, setIsDeleteUnitDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedUnitForQr, setSelectedUnitForQr] = useState<Unit | null>(null);

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleAddProperty = (newProperty: Property) => {
    setPropertiesList((prev) => [newProperty, ...prev]);
    setSelectedProperty(newProperty);
  };

  const handleOpenAssignSheet = (unit: Unit) => {
    setSelectedUnitForAssignment(unit);
    setIsAssignSheetOpen(true);
  };

  const handleAssignTenant = (tenant: Tenant) => {
    setUnitsList((prev) =>
      prev.map((unit) =>
        unit.id === tenant.unitId
          ? { ...unit, status: "Occupied", tenant: tenant.name }
          : unit
      )
    );
  };

  const handleOpenEditSheet = (unit: Unit) => {
    setSelectedUnitForEdit(unit);
    setIsEditSheetOpen(true);
  };

  const handleUpdateUnit = (updatedUnit: Unit) => {
    setUnitsList((prev) =>
      prev.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit))
    );
  };

  const handleOpenDeleteUnitDialog = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteUnitDialogOpen(true);
  };

  const handleDeleteUnit = () => {
    if (unitToDelete) {
      setUnitsList((prev) => prev.filter((u) => u.id !== unitToDelete.id));
      setUnitToDelete(null);
      setIsDeleteUnitDialogOpen(false);
    }
  };

  const handleOpenQrDialog = (unit: Unit) => {
    setSelectedUnitForQr(unit);
    setIsQrDialogOpen(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertiesList((prev) => prev.filter((p) => p.id !== property.id));
    if (selectedProperty?.id === property.id) {
      setSelectedProperty(
        propertiesList.find((p) => p.id !== property.id) || null
      );
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <SiteHeader title="Properties" />

      <div className="p-4 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4 h-[calc(100vh-120px)]">
        {/* Left panel - Property list */}
        <div className="border rounded-lg bg-sidebar p-4 flex flex-col min-h-0">
          <div className="mb-4 flex items-center gap-2">
            <SearchBar
              placeholder="Search Properties..."
              onAdd={() => handleAddProperty}
            />
          </div>

          <ScrollArea className="flex-1 overflow-y-auto h-150">
            <PropertyList
              properties={propertiesList}
              activeId={selectedProperty?.id}
              onSelect={handleSelectProperty}
              onDelete={handleDeleteProperty}
            />
          </ScrollArea>
        </div>

        {/* Right panel - Selected property detail */}
        <div className="flex flex-col">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-medium">
              {selectedProperty?.name || "Select a Property"}
            </h2>

            <AddProperty onAdd={handleAddProperty} />
          </div>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead>Unit name</TableHead>
                  <TableHead>Rent Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {unitsList.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>

                    <TableCell>{unit.rentAmount}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          unit.status === "Vacant" ? "destructive" : "success"
                        }
                      >
                        {unit.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {unit.tenant ? (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant={"link"} className="p-0">
                              {unit.tenant}
                            </Button>
                          </SheetTrigger>
                          <SheetContent side={isMobile ? "bottom" : "right"}>
                            <SheetHeader>
                              <SheetTitle>Edit Tenant</SheetTitle>
                              <SheetDescription>{unit.tenant}</SheetDescription>
                            </SheetHeader>
                            <FieldGroup className="flex-1 px-4 py-6">
                              <Field>
                                <Label htmlFor="unit-name">Unit Name</Label>
                                <Input
                                  id="unit-name"
                                  value={unit?.name || ""}
                                  disabled
                                  className="bg-muted"
                                />
                              </Field>

                              <Field>
                                <Label htmlFor="tenant-name">Tenant Name</Label>
                                <Input
                                  id="tenant-name"
                                  placeholder="Ex: John Doe"
                                  value={unit.tenant}
                                  onChange={(e) => setName(e.target.value)}
                                  required
                                />
                              </Field>

                              <Field>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                  id="phone"
                                  placeholder="Ex: +250 788 123 456"
                                  value={"+250712345678"}
                                  onChange={(e) => setPhone(e.target.value)}
                                  required
                                />
                              </Field>

                              <Field>
                                <Label htmlFor="email">
                                  Email Address (Optional)
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="Ex: john.doe@example.com"
                                  value={"johndoe@example.com"}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                              </Field>
                            </FieldGroup>
                            <SheetFooter>
                              <Button type="submit">Save</Button>
                              <SheetClose asChild>
                                <Button type="submit" variant={"outline"}>
                                  Close
                                </Button>
                              </SheetClose>
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                      ) : (
                        "–"
                      )}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant={"outline"} size={"icon-xs"}>
                            <MoreHorizontalIcon />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side={isMobile ? "bottom" : "right"}
                          align={isMobile ? "end" : "start"}
                        >
                          <DropdownMenuItem
                            onClick={() => handleOpenEditSheet(unit)}
                          >
                            <Pencil />
                            <span>Edit Property</span>
                          </DropdownMenuItem>
                          {unit.status === "Vacant" && (
                            <DropdownMenuItem
                              onClick={() => handleOpenAssignSheet(unit)}
                            >
                              <User className="size-4" />
                              <span>Assign Tenant</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleOpenQrDialog(unit)}
                          >
                            <QrCodeIcon />
                            <span>Ticket QR code</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleOpenDeleteUnitDialog(unit)}
                          >
                            <Trash2Icon />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>

            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              1
            </Button>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              2
            </Button>

            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>

      <AssignTenant
        open={isAssignSheetOpen}
        onOpenChange={setIsAssignSheetOpen}
        unit={selectedUnitForAssignment}
        onAssign={handleAssignTenant}
      />

      <EditUnitSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        unit={selectedUnitForEdit}
        onSave={handleUpdateUnit}
      />

      <AlertDialog
        open={isDeleteUnitDialogOpen}
        onOpenChange={setIsDeleteUnitDialogOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              unit <strong>{unitToDelete?.name}</strong> and remove its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteUnit}>
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TicketQrDialog
        open={isQrDialogOpen}
        onOpenChange={setIsQrDialogOpen}
        unit={selectedUnitForQr}
        propertyName={selectedProperty?.name || "Property"}
      />
    </div>
  );
}
