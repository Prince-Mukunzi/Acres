import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { TenantsTable } from "@/components/shared/TenantTable";
import { useState } from "react";

// Color-coded status badge
export function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Paid";
  return <Badge variant={isPaid ? "success" : "destructive"}>{status}</Badge>;
}

export default function Tenants() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col space-y-8">
      <SiteHeader title="Tenants" />

      <div className="p-4 grid grid-cols-1 space-y-8 align-end">
        <SearchBar
          placeholder="Search Tenants..."
          onSearchChange={setSearchQuery}
        />

        {/* Tenant listing table */}
        <TenantsTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
