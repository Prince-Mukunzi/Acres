import { Search, MoreHorizontal, PlusIcon } from "lucide-react";
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
import { SiteHeader } from "@/components/layout/site-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/layout/search-bar";
import { tenants } from "@/lib/seed/tenants";

// Color-coded status badge
export function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Paid";
  return <Badge variant={isPaid ? "success" : "destructive"}>{status}</Badge>;
}

export default function Tenants() {
  return (
    <div className="flex flex-col space-y-8">
      <SiteHeader title="Tenants" />

      <div className="p-4 grid grid-cols-1 space-y-8 align-end">
        <SearchBar placeholder="Search Tenants..." />

        {/* Tenant listing table */}
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
              {tenants.map((tenant, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.unit}
                  </TableCell>
                  <TableCell>{tenant.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.date}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
