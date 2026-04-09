"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSidebar } from "../ui/sidebar";
import { useState, useMemo } from "react";
import { StatusBadge } from "@/pages/app/Tenants";
import {
  AlertCircle,
  CheckCircle,
  MoreHorizontalIcon,
  Pencil,
  Trash2Icon,
  Users2,
} from "lucide-react";
import { EditTenantSheet } from "@/components/features/tenants/EditTenantSheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Card } from "@/components/ui/card";
import { useTenants } from "@/hooks/useApiQueries";
import {
  useToggleTenantStatus,
  useDeleteTenant,
} from "@/hooks/useApiMutations";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type TenantsTableProps = {
  filterStatus?: "Paid" | "Overdue";
  searchQuery?: string;
};

export function TenantsTable({
  filterStatus,
  searchQuery = "",
}: TenantsTableProps) {
  const { isMobile } = useSidebar();
  const {
    data: tenantList = [],
    isLoading,
    refetch: fetchTenants,
  } = useTenants(1, searchQuery);

  // Controlled edit sheet state
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any | null>(null);

  const toggleMutation = useToggleTenantStatus();
  const deleteMutation = useDeleteTenant();

  const filteredTenants = tenantList.filter((tenant) =>
    filterStatus ? tenant.status === filterStatus : true
  );

  const handleOpenEdit = (tenant: any) => {
    setEditingTenant(tenant);
    setEditSheetOpen(true);
  };

  const toggleTenantStatus = async (id: string) => {
    const tenant = tenantList.find((t) => t.id === id);
    if (!tenant) return;
    const newStatus = tenant.status === "Overdue" ? "Paid" : "Overdue";
    const nameParts = (tenant.name || "").split(" ");
    toggleMutation.mutate({
      id,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      status: newStatus,
    });
  };

  const deleteTenant = async (id: string) => {
    deleteMutation.mutate(id);
  };

  const tenantColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tenant Name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit Name",
      },
      {
        accessorKey: "amount",
        header: "Tenant Amount",
        cell: ({ row }) => (
          <span>RWF {(row.original.amount || 0).toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} size={"icon-xs"}>
                  <MoreHorizontalIcon />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleOpenEdit(tenant)}>
                  <Pencil />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTenantStatus(tenant.id)}>
                  {tenant.status === "Overdue" ? (
                    <>
                      <CheckCircle />
                      <span>Mark as Paid</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle />
                      <span>Mark as Overdue</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deleteTenant(tenant.id)}
                >
                  <Trash2Icon />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [isMobile, toggleTenantStatus, deleteTenant]
  );

  return (
    <>
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead className="font-semibold text-foreground">
                  Tenant Name
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Unit Name
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Tenant Amount
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Due Date
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
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
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <DataTable
            columns={tenantColumns}
            data={filteredTenants}
            noDataChildren={
              <Empty className="border-none w-full flex flex-col items-center justify-center py-6">
                <EmptyMedia>
                  <Users2 className="h-8 w-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No tenants found</EmptyTitle>
                <EmptyDescription>
                  {searchQuery
                    ? "No tenants match your search."
                    : filterStatus
                    ? `There are no ${filterStatus.toLowerCase()} tenants right now.`
                    : "No tenants exist in the system yet."}
                </EmptyDescription>
              </Empty>
            }
          />
        )}
      </Card>

      {/* Controlled Edit Tenant Sheet */}
      {editingTenant && (
        <EditTenantSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          tenant={{
            id: editingTenant.id,
            name: editingTenant.name,
            phone: editingTenant.phone,
            email: editingTenant.email,
            unitName: editingTenant.unit,
            startDate: editingTenant.startDate,
            endDate: editingTenant.date,
          }}
          onSave={fetchTenants}
        />
      )}
    </>
  );
}
