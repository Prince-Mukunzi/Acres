import {
  MoreHorizontalIcon,
  Pencil,
  QrCodeIcon,
  Trash2Icon,
  User,
  SquaresUnite,
  Building2Icon,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddProperty } from "@/components/features/properties/PropertyForm";
import { AssignTenant } from "@/components/features/tenants/AssignTenantSheet";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
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
import { EditTenantSheet } from "@/components/features/tenants/EditTenantSheet";
import { AddUnitDialog } from "@/components/features/properties/AddUnitDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi } from "@/utils/api";
import { useProperties, useUnits } from "@/hooks/useApiQueries";
import { useAddProperty, useDeleteProperty, useAddBulkUnits, useEditProperty } from "@/hooks/useApiMutations";
import { useQueryClient } from "@tanstack/react-query";

export default function Properties() {
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const { data: propertiesList = [], isLoading: isLoadingProperties } = useProperties();
  const { data: unitsList = [], isLoading: isLoadingUnits } = useUnits(selectedProperty?.id);

  const addPropertyMutation = useAddProperty();
  const deletePropertyMutation = useDeleteProperty();
  const bulkUnitsMutation = useAddBulkUnits();
  const editPropertyMutation = useEditProperty();

  // Auto-select first property if none selected
  if (propertiesList.length > 0 && !selectedProperty) {
    setSelectedProperty(propertiesList[0]);
  }

  const [isAssignSheetOpen, setIsAssignSheetOpen] = useState(false);
  const [selectedUnitForAssignment, setSelectedUnitForAssignment] =
    useState<Unit | null>(null);

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedUnitForEdit, setSelectedUnitForEdit] = useState<Unit | null>(
    null,
  );

  const [isDeleteUnitDialogOpen, setIsDeleteUnitDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedUnitForQr, setSelectedUnitForQr] = useState<Unit | null>(null);

  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [propertySearch, setPropertySearch] = useState("");

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleAddProperty = async (
    newProperty: Property,
    unitSeed?: { label: string; count: number; amount: string },
  ) => {
    addPropertyMutation.mutate(newProperty, {
      onSuccess: async (data: any) => {
        const savedProperty = { ...newProperty, id: data.id };
        setSelectedProperty(savedProperty);
        setIsAddPropertyOpen(false);

        // Auto-create initial units if seed data was provided
        if (unitSeed && unitSeed.count > 0) {
          const seedUnits = Array.from(
            { length: unitSeed.count },
            (_, i) => ({
              unitName: `${unitSeed.label} ${i + 1}`,
              rentAmount: parseInt(unitSeed.amount.replace(/\D/g, "")) || 0,
              unitStatus: "VACANT",
            })
          );
          
          bulkUnitsMutation.mutate({
            propertyId: data.id,
            units: seedUnits,
          });
        }
      }
    });
  };

  const handleAddUnits = async (newUnits: Unit[]) => {
    if (!selectedProperty?.id) return;
    
    bulkUnitsMutation.mutate({
      propertyId: selectedProperty.id,
      units: newUnits.map((u) => ({
        unitName: u.name,
        rentAmount: parseInt(u.rentAmount.replace(/\D/g, "")) || 0,
        unitStatus: "VACANT",
      }))
    });
  };

  const handleOpenAssignSheet = (unit: Unit) => {
    setSelectedUnitForAssignment(unit);
    setIsAssignSheetOpen(true);
  };

  const handleAssignTenant = async (tenant: Tenant) => {
    if (!selectedProperty?.id) return;
    try {
      const p1 = fetchApi("/api/v1/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: tenant.name.split(" ")[0] || "",
          lastName: tenant.name.split(" ").slice(1).join(" ") || "",
          phoneNumber: tenant.phone,
          email: tenant.email || "",
          unitID: tenant.unitId,
        }),
      });

      const unitToUpdate = unitsList.find((u) => u.id === tenant.unitId);
      
      const requests = [p1];
      
      if (unitToUpdate) {
        requests.push(fetchApi(`/api/v1/unit/${tenant.unitId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitName: unitToUpdate.name,
            rentAmount:
              parseInt(unitToUpdate.rentAmount.replace(/\D/g, "")) || 0,
            unitStatus: "OCCUPIED",
            propertyId: selectedProperty.id,
          }),
        }));
      }

      await Promise.all(requests);


      queryClient.invalidateQueries({ queryKey: ["units", selectedProperty.id] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditSheet = (unit: Unit) => {
    setSelectedUnitForEdit(unit);
    setIsEditSheetOpen(true);
  };

  const handleUpdateUnit = async (updatedUnit: Unit) => {
    try {
      await fetchApi(`/api/v1/unit/${updatedUnit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitName: updatedUnit.name,
          rentAmount: parseInt(updatedUnit.rentAmount.replace(/\D/g, "")) || 0,
          unitStatus: updatedUnit.status,
          propertyId: selectedProperty?.id,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["units", selectedProperty?.id] });
      } catch (error) {
      console.error(error);
    } finally {
      setIsEditSheetOpen(false);
    }
  };

  const handleOpenDeleteUnitDialog = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteUnitDialogOpen(true);
  };

  const handleDeleteUnit = async () => {
    if (unitToDelete && selectedProperty?.id) {
      try {
        await fetchApi(`/api/v1/unit/${unitToDelete.id}`, { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ['units', selectedProperty.id] });
        setUnitToDelete(null);
        setIsDeleteUnitDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleOpenQrDialog = (unit: Unit) => {
    setSelectedUnitForQr(unit);
    setIsQrDialogOpen(true);
  };

  const handleDeleteProperty = async (property: Property) => {
    deletePropertyMutation.mutate(property.id);
    if (selectedProperty?.id === property.id) {
      setSelectedProperty(null);
    }
  };

  const handleEditPropertyOpen = (property: Property) => {
    setPropertyToEdit(property);
    setIsEditPropertyOpen(true);
  };

  const handleEditProperty = (updatedProperty: Property) => {
    editPropertyMutation.mutate(
      { id: updatedProperty.id, name: updatedProperty.name, address: updatedProperty.address },
      {
        onSuccess: () => {
          if (selectedProperty?.id === updatedProperty.id) {
            setSelectedProperty({ ...selectedProperty, name: updatedProperty.name, address: updatedProperty.address });
          }
          setIsEditPropertyOpen(false);
        }
      }
    );
  };

  const handleDownloadReport = async (property: Property) => {
    try {
      const res = await fetchApi(`/api/v1/unit?propertyId=${property.id}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const units = await res.json();
      
      const headers = ["Unit Name", "Rent Amount", "Status", "Tenant"];
      const rows = units.map((u: any) => [
        `"${u.name}"`,
        `"${u.rentAmount}"`,
        `"${u.status}"`,
        `"${u.tenant || "None"}"`
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map((r: any) => r.join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${property.name.replace(/\\s+/g, '_')}_units_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
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
              onAdd={() => setIsAddPropertyOpen(true)}
              onSearchChange={setPropertySearch}
            />
          </div>

          <ScrollArea className="flex-1 overflow-y-auto h-150">
            {isLoadingProperties ? (
              <div className="flex flex-col gap-3 mt-4">
                <Skeleton className="h-42 w-full" />
                <Skeleton className="h-42 w-full" />
                <Skeleton className="h-42 w-full" />
              </div>
            ) : propertiesList.length === 0 ? (
              <Empty className="mt-8 border-none bg-transparent">
                <EmptyMedia>
                  <Building2Icon className="h-8 w-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No properties found</EmptyTitle>
                <EmptyDescription>
                  Add a new property to start.
                </EmptyDescription>
              </Empty>
            ) : (
              <PropertyList
                properties={propertiesList.filter((p) =>
                  p.name.toLowerCase().includes(propertySearch.toLowerCase()),
                )}
                activeId={selectedProperty?.id}
                onSelect={handleSelectProperty}
                onEdit={handleEditPropertyOpen}
                onDownload={handleDownloadReport}
                onDelete={handleDeleteProperty}
              />
            )}
          </ScrollArea>
        </div>

        {/* Right panel - Selected property detail */}
        <div className="flex flex-col">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-medium">
              {selectedProperty?.name || "Select a Property"}
            </h2>

            {selectedProperty && (
              <AddUnitDialog
                property={selectedProperty}
                onAddUnits={handleAddUnits}
              />
            )}
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
                {isLoadingUnits ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : unitsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <Empty className="border-none w-full flex flex-col items-center justify-center">
                        <EmptyMedia>
                          <SquaresUnite className="h-8 w-8 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No units found</EmptyTitle>
                        <EmptyDescription>
                          This property doesn't have any units yet.
                        </EmptyDescription>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  unitsList.map((unit) => (
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
                        {unit.tenant ? <EditTenantSheet unit={unit} /> : "–"}
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
                              <span>Edit Unit</span>
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
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
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

      <AddProperty
        open={isAddPropertyOpen}
        onOpenChange={setIsAddPropertyOpen}
        onAdd={handleAddProperty}
      />

      <AddProperty
        open={isEditPropertyOpen}
        onOpenChange={setIsEditPropertyOpen}
        onAdd={handleEditProperty}
        initialData={propertyToEdit || undefined}
      />
    </div>
  );
}
