import { MoreHorizontalIcon, Pencil, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/shared/SearchBar";
import { tenants } from "@/lib/seed/tenants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Color-coded status badge
export function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Paid";
  return <Badge variant={isPaid ? "success" : "destructive"}>{status}</Badge>;
}

export default function Tenants() {
  const { isMobile } = useSidebar();

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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"outline"} size={"icon-xs"}>
                          <MoreHorizontalIcon />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-24 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        <DropdownMenuItem>
                          <Pencil />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
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
      </div>
    </div>
  );
}
