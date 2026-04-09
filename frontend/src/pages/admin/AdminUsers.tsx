import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users2,
  MoreHorizontal,
  Ban,
  Trash2,
  KeyRound,
  Send,
} from "lucide-react";
import { useAdminUsers } from "@/hooks/useApiQueries";
import {
  useToggleSuspend,
  useDeleteAdminUser,
  useImpersonateUser,
} from "@/hooks/useApiMutations";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAdminUsers();
  const toggleSuspend = useToggleSuspend();
  const deleteUser = useDeleteAdminUser();
  const impersonateUser = useImpersonateUser();
  const { user: currentUser, login } = useAuth();

  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleToggleSuspend = (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast.error("You cannot suspend yourself.");
      return;
    }
    toggleSuspend.mutate(id, {
      onSuccess: () => toast.success(`Toggled suspension for ${name}`),
      onError: () => toast.error("Failed to update suspension status"),
    });
  };

  const handleImpersonate = (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast.error("You are already this user.");
      return;
    }
    const loadingToast = toast.loading(
      `Generating secure session for ${name}...`,
    );
    impersonateUser.mutate(id, {
      onSuccess: (data: any) => {
        toast.dismiss(loadingToast);
        toast.success(`Successfully impersonating ${name}`);
        login(data.user);
        window.location.href = "/dashboard";
      },
      onError: () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to generate impersonation session");
      },
    });
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    if (deleteConfirmText !== "DELETE") {
      toast.error("You must type DELETE exactly to confirm.");
      return;
    }

    const toastId = toast.loading(
      "Purging user and all cascading data from the infrastructure...",
    );
    deleteUser.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success("User permanently deleted.", { id: toastId });
        setUserToDelete(null);
        setDeleteConfirmText("");
      },
      onError: () => {
        toast.error("Failed to delete user.", { id: toastId });
        setUserToDelete(null);
        setDeleteConfirmText("");
      },
    });
  };

  const userColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
          const plan = row.original.plan;
          const variant =
            plan === "Enterprise"
              ? "success"
              : plan === "Pro"
                ? "warning"
                : "outline";
          return (
            <Badge
              variant={variant as any}
              className="font-normal capitalize shadow-none"
            >
              {plan}
            </Badge>
          );
        },
      },
      {
        accessorKey: "infrastructure",
        header: "Infrastructure",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.infrastructure}
          </span>
        ),
      },
      {
        accessorKey: "joined",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.joined
              ? format(new Date(row.original.joined), "MMM d, yyyy")
              : "N/A"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const u = row.original;
          const isSuspended = u.isSuspended || u.issuspended;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    toast("Messaging system not yet integrated", { icon: "💬" })
                  }
                >
                  <Send className="h-4 w-4" />
                  Send communication
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleImpersonate(u.id, u.name)}
                >
                  <KeyRound className="h-4 w-4" />
                  Impersonate Session
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleToggleSuspend(u.id, u.name)}
                >
                  <Ban className="h-4 w-4" />
                  {isSuspended ? "Unsuspend User" : "Suspend User"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setUserToDelete(u)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [currentUser?.id],
  );

  return (
    <div className="p-6 flex flex-col space-y-4">
      <SiteHeader title="Subscriptions" />

      <div className="p-4 space-y-6">
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Plan
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Infrastructure
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Joined
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Actions
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
                columns={userColumns}
                data={users}
                noDataChildren={
                  <Empty className="border-none w-full flex flex-col items-center justify-center py-6">
                    <EmptyMedia>
                      <Users2 className="h-8 w-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No subscriptions</EmptyTitle>
                    <EmptyDescription>
                      The platform currently has zero operating landlords.
                    </EmptyDescription>
                  </Empty>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Permanent Deletion Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to irreversibly delete{" "}
              <strong>{userToDelete?.name}</strong> and completely cascade-purge
              all associated Properties, Units, Tenants, and Tickets from the
              database infrastructure.
              <br />
              <br />
              This action cannot be undone. To confirm, type{" "}
              <strong>DELETE</strong> below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mt-2"
              placeholder="DELETE"
              autoFocus
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteConfirmText !== "DELETE"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hardware Purge User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
