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
import { TenantProfileSheet } from "@/components/features/tenants/TenantProfileSheet";
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
  useAddCommunication,
} from "@/hooks/useApiMutations";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

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

  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<any | null>(null);

  // Overdue reminder prompt state
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [pendingOverdueTenant, setPendingOverdueTenant] = useState<any | null>(
    null,
  );

  const toggleMutation = useToggleTenantStatus();
  const deleteMutation = useDeleteTenant();
  const sendComm = useAddCommunication();

  const filteredTenants = tenantList.filter((tenant) =>
    filterStatus ? tenant.status === filterStatus : true,
  );

  const handleOpenProfile = (tenant: any) => {
    setViewingTenant(tenant);
    setProfileSheetOpen(true);
  };

  const toggleTenantStatus = async (id: string) => {
    const tenant = tenantList.find((t) => t.id === id);
    if (!tenant) return;
    const newStatus = tenant.status === "Overdue" ? "Paid" : "Overdue";
    const nameParts = (tenant.name || "").split(" ");

    if (newStatus === "Overdue") {
      setPendingOverdueTenant(tenant);
      toggleMutation.mutate(
        {
          id,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          status: newStatus,
        },
        {
          onSuccess: () => {
            setReminderDialogOpen(true);
          },
        },
      );
    } else {
      toggleMutation.mutate({
        id,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        status: newStatus,
      });
    }
  };

  const handleSendReminder = () => {
    if (!pendingOverdueTenant) return;
    sendComm.mutate(
      {
        tenantID: pendingOverdueTenant.id,
        title: "Overdue Rent Reminder",
        body: `Dear ${pendingOverdueTenant.name}, this is a reminder that your rent payment is currently overdue. Please ensure your payment is submitted as soon as possible.`,
        channel: "email",
      },
      {
        onSuccess: () => {
          toast.success("Rent reminder sent successfully");
          setReminderDialogOpen(false);
          setPendingOverdueTenant(null);
        },
        onError: () => {
          toast.error("Failed to send reminder");
          setReminderDialogOpen(false);
          setPendingOverdueTenant(null);
        },
      },
    );
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
                <DropdownMenuItem onClick={() => handleOpenProfile(tenant)}>
                  <Pencil />
                  <span>View Details</span>
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
    [isMobile, toggleTenantStatus, deleteTenant],
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

      {/* Controlled Tenant Profile Sheet */}
      {viewingTenant && (
        <TenantProfileSheet
          open={profileSheetOpen}
          onOpenChange={setProfileSheetOpen}
          tenant={viewingTenant}
          onRefresh={fetchTenants}
        />
      )}

      {/* Overdue Rent Reminder Prompt */}
      <AlertDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Rent Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingOverdueTenant?.name} has been marked as overdue. Would you
              like to send them a rent reminder email?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setReminderDialogOpen(false);
                setPendingOverdueTenant(null);
              }}
            >
              No, skip
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendReminder}
              disabled={sendComm.isPending}
            >
              {sendComm.isPending ? "Sending..." : "Send reminder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
