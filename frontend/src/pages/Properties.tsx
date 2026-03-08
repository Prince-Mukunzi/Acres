import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  Users,
  Wrench,
  FileText,
  SquaresUnite,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/site-header";

interface Property {
  id: number;
  name: string;
  address: string;
  status: "Active" | "Inactive";
  units: number;
  tenants: number;
  tickets: number;
}

interface Unit {
  name: string;
  rentAmount: string;
  status: "Vacant" | "Occupied";
  tenant: string;
}

const properties: Property[] = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  name: "ALU Hostels",
  address: "KN 123 ST Bumbogo",
  status: "Active",
  units: 12,
  tenants: 34,
  tickets: 4,
}));

const propertyUnits: Unit[] = Array.from({ length: 7 }, () => ({
  name: "Apt 1",
  rentAmount: "RF 500,000",
  status: "Vacant",
  tenant: "John Doe",
}));

export default function Properties() {
  const [selectedProperty, setSelectedProperty] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Properties" />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Property list */}
        <div className="w-90 border-r border-border bg-sidebar p-5 flex flex-col">
          <h1 className="mb-4 text-xl font-medium">My Properties</h1>

          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search Property" className="pl-9" />
            </div>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable property card list */}
          <div className="space-y-3 overflow-y-auto">
            {properties.map((property) => (
              <Card
                key={property.id}
                className={cn(
                  "cursor-pointer transition-colors hover:border-primary/30",
                  selectedProperty === property.id &&
                    "border-primary/50 bg-accent/50"
                )}
                onClick={() => setSelectedProperty(property.id)}
              >
                <CardContent>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{property.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {property.address}
                      </p>
                    </div>
                    <Badge variant="success">
                      {property.status}
                    </Badge>
                  </div>
                  {/* Property quick stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <SquaresUnite className="h-3 w-3" />
                      {property.units} Units
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {property.tenants} Tenants
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {property.tickets} Tickets
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right panel - Selected property detail */}
        <div className="flex-1 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">ALU Hostels</h2>
            </div>
            <Button className="gap-2">
              Add Unit
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
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
              {propertyUnits.map((unit, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.rentAmount}</TableCell>
                  <TableCell>
                    <Badge variant={unit.status === "Vacant" ? "destructive" : "success"}>
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
