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
import { useState, useEffect } from "react";
import { StatusBadge } from "@/pages/Tenants";
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
import { Card } from "../ui/card";

type TenantsTableProps = {
  filterStatus?: "Paid" | "Overdue";
  searchQuery?: string;
};

export function TenantsTable({
  filterStatus,
  searchQuery = "",
}: TenantsTableProps) {
  const { isMobile } = useSidebar();
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Controlled edit sheet state
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any | null>(null);

  const fetchTenants = () => {
    setIsLoading(true);
    fetch("/api/v1/tenant")
      .then((res) => res.json())
      .then((data) => setTenantList(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenantList
    .filter((tenant) => (filterStatus ? tenant.status === filterStatus : true))
    .filter((tenant) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (tenant.name || "").toLowerCase().includes(q) ||
        (tenant.unit || "").toLowerCase().includes(q)
      );
    });

  const handleOpenEdit = (tenant: any) => {
    setEditingTenant(tenant);
    setEditSheetOpen(true);
  };

  const toggleTenantStatus = async (id: string) => {
    const tenant = tenantList.find((t) => t.id === id);
    if (!tenant) return;
    const newStatus = tenant.status === "Overdue" ? "Paid" : "Overdue";

    try {
      const nameParts = (tenant.name || "").split(" ");
      await fetch(`/api/v1/tenant/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          status: newStatus,
        }),
      });
      setTenantList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
      );
    } catch (e) {
      console.error("Failed to toggle status:", e);
    }
  };

  const deleteTenant = async (id: string) => {
    try {
      await fetch(`/api/v1/tenant/${id}`, { method: "DELETE" });
      setTenantList((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Card className="p-0 overflow-hidden">
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
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
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
              ))
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <Empty className="border-none w-full flex flex-col items-center justify-center">
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
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.unit}</TableCell>
                  <TableCell>{tenant.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell>{tenant.dueDate}</TableCell>
                  <TableCell>
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
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(tenant)}
                        >
                          <Pencil />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleTenantStatus(tenant.id)}
                        >
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
