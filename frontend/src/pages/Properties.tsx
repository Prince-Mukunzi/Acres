import { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
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

import { SiteHeader } from "@/components/layout/site-header";
import { SearchBar } from "@/components/layout/search-bar";
import { PropertyList } from "@/components/layout/property";
import { properties } from "@/lib/seed/properties";
import { units } from "@/lib/seed/units";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Properties() {
  return (
    <div className="flex flex-col h-fit space-y-4">
      <SiteHeader title="Properties" />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Property list */}
        <div className="w-fit border rounded-lg border-border bg-sidebar p-4 flex flex-col">
          <div className="mb-4 flex items-center gap-2">
            <SearchBar placeholder="Search Properties..." />
          </div>

          {/* Scrollable property card list */}
          <ScrollArea className="h-fill">
            <PropertyList properties={properties} />
          </ScrollArea>
        </div>

        {/* Right panel - Selected property detail */}
        <div className="flex-1 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-medium">ALU Hostels</h2>
            <Button className="gap-2">
              Add Unit
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">
                    Unit name
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Rent Amount
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Tenant
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit, i) => (
                  <TableRow key={i}>
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
                      {unit.tenant}
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
    </div>
  );
}
