import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useAdminProperties } from "@/hooks/useApiQueries";
import { Building2, Search } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminProperties() {
  const { data: properties = [], isLoading } = useAdminProperties();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    const lower = searchTerm.toLowerCase();
    return properties.filter((p: any) => {
      return (
        p.name?.toLowerCase().includes(lower) ||
        p.address?.toLowerCase().includes(lower) ||
        p.owner_name?.toLowerCase().includes(lower)
      );
    });
  }, [properties, searchTerm]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Property Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.address || "—"}
          </span>
        ),
      },
      {
        accessorKey: "owner_name",
        header: "Landlord",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.owner_name || "—"}</span>
        ),
      },
      {
        accessorKey: "units",
        header: "Units",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal shadow-none">
            {row.original.units ?? 0}
          </Badge>
        ),
      },
      {
        accessorKey: "tenants",
        header: "Tenants",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal shadow-none">
            {row.original.tenants ?? 0}
          </Badge>
        ),
      },
      {
        accessorKey: "tickets",
        header: "Tickets",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal shadow-none">
            {row.original.tickets ?? 0}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6 flex flex-col space-y-4">
      <SiteHeader title="Properties" />
      <div className="px-4 pt-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, address, or landlord..."
            className="pl-8 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Property Name</TableHead>
                  <TableHead className="font-semibold text-foreground">Address</TableHead>
                  <TableHead className="font-semibold text-foreground">Landlord</TableHead>
                  <TableHead className="font-semibold text-foreground">Units</TableHead>
                  <TableHead className="font-semibold text-foreground">Tenants</TableHead>
                  <TableHead className="font-semibold text-foreground">Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : properties.length === 0 ? (
          <Empty className="border-none w-full flex flex-col items-center justify-center py-12">
            <EmptyMedia>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No properties</EmptyTitle>
            <EmptyDescription>
              No properties have been created on the platform yet.
            </EmptyDescription>
          </Empty>
        ) : (
          <Card className="p-0 overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredProperties}
              noDataChildren={
                <Empty className="border-none w-full flex flex-col items-center justify-center py-6">
                  <EmptyMedia>
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No results</EmptyTitle>
                  <EmptyDescription>
                    No properties match your search.
                  </EmptyDescription>
                </Empty>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}
