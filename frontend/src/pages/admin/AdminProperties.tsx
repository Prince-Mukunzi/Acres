import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PropertyList } from "@/components/features/properties/PropertyCard";
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

export default function AdminProperties() {
  const { data: properties = [], isLoading } = useAdminProperties();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    const lower = searchTerm.toLowerCase();
    return properties.filter((c: any) => {
      const propMatch = c.propertyName?.toLowerCase().includes(lower);
      return propMatch;
    });
  }, [properties, searchTerm]);

  return (
    <div className="p-6 flex flex-col space-y-4">
      <SiteHeader title="Properties" />
      <div className="px-4 pt-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Property Name..."
            className="pl-8 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
            ))}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PropertyList properties={filteredProperties} isAdminView />
          </div>
        )}
      </div>
    </div>
  );
}
