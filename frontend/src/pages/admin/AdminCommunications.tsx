import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, MessageCircle } from "lucide-react";
import { useAdminCommunications } from "@/hooks/useApiQueries";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminCommunications() {
  const { data: communications = [], isLoading } = useAdminCommunications();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewBody, setViewBody] = useState<any>(null);

  const filteredCommunications = useMemo(() => {
    if (!searchTerm) return communications;
    const lower = searchTerm.toLowerCase();
    return communications.filter((c: any) => {
      const propMatch = c.propertyName?.toLowerCase().includes(lower);
      return propMatch;
    });
  }, [communications, searchTerm]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "senderName",
        header: "Sender",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.senderName || "System"}
          </span>
        ),
      },
      {
        accessorKey: "propertyName",
        header: "Property",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.propertyName || "Global"}
          </span>
        ),
      },
      {
        accessorKey: "tenantName",
        header: "Recipient",
        cell: ({ row }) => row.original.tenantName || "Unknown",
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Sent At",
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return "N/A";
          return format(new Date(date), "PPpp");
        },
      },
      {
        accessorKey: "view",
        header: "View",
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Button variant="ghost" onClick={() => setViewBody(row.original)}>
              <span className="sr-only">Read Communication</span>
              <Eye className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="p-6 flex flex-col space-y-4">
      <SiteHeader title="Communications Monitor" />

      <div className="px-4 pt-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Audit by Property Name..."
            className="pl-8 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-6 pt-2">
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">
                      Sender
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Property
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Recipient
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Sent At
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      View
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
                columns={columns}
                data={filteredCommunications}
                noDataChildren={
                  <Empty className="border-none w-full flex flex-col items-center justify-center py-6">
                    <EmptyMedia>
                      <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No communication logs</EmptyTitle>
                    <EmptyDescription>
                      No Communications found matching your search criteria.
                    </EmptyDescription>
                  </Empty>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewBody} onOpenChange={(o) => !o && setViewBody(null)}>
        <DialogContent className="max-w-2xl bg-card border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{viewBody?.title}</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Communication sent by <strong>{viewBody?.senderName}</strong>{" "}
              targeting <strong>{viewBody?.tenantName}</strong> at{" "}
              <strong>{viewBody?.propertyName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 rounded-md bg-secondary/30 border border-muted text-sm whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
            {viewBody?.body || (
              <span className="text-muted-foreground italic">
                Message body empty or suppressed.
              </span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
