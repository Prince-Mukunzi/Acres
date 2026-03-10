import type { Property } from "@/types/property";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FolderCog, SquaresUnite, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card
      onClick={property.onClick}
      className={cn(
        "cursor-pointer  hover:bg-accent/80",
        property.selected && "bg-accent/80"
      )}
    >
      <CardHeader>
        <CardTitle>{property.name}</CardTitle>
        <CardDescription>{property.address}</CardDescription>
      </CardHeader>
      <CardContent className="flex space-x-2">
        <CardDescription className="flex space-x-2">
          <SquaresUnite size={16} />
          <p className="text-xs">{property.units} units</p>
        </CardDescription>
        <CardDescription className="flex space-x-2">
          <Users size={16} />
          <p className="text-xs">{property.tenants} tenants</p>
        </CardDescription>
        <CardDescription className="flex space-x-2">
          <FolderCog size={16} />
          <p className="text-xs">{property.tickets} tickets</p>
        </CardDescription>
      </CardContent>
    </Card>
  );
}

type PropertyListProps = {
  properties: Property[];
};

export function PropertyList({ properties }: PropertyListProps) {
  return (
    <div className="flex flex-col space-y-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
