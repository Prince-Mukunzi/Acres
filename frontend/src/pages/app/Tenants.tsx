import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { TenantsTable } from "@/components/shared/TenantTable";
import { useState } from "react";
import { AssignTenant } from "@/components/features/tenants/AssignTenantSheet";
import { useAssignTenant } from "@/hooks/useApiMutations";

// Color-coded status badge
export function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Paid";
  return <Badge variant={isPaid ? "success" : "destructive"}>{status}</Badge>;
}

export default function Tenants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignTenant, setShowAssignTenant] = useState(false);
  const assignTenantMutation = useAssignTenant();

  const handleAssignTenant = (tenant: any) => {
    assignTenantMutation.mutate(tenant);
  };

  return (
    <>
      <div className="flex flex-col space-y-8">
        <SiteHeader title="Tenants" />

        <div className="p-4 grid grid-cols-1 space-y-8 align-end">
          <SearchBar
            placeholder="Search Tenants..."
            onSearchChange={setSearchQuery}
            onAdd={() => setShowAssignTenant(true)}
          />

          {/* Tenant listing table */}
          <TenantsTable searchQuery={searchQuery} />
        </div>
      </div>

      {showAssignTenant && (
        <AssignTenant
          open={showAssignTenant}
          onOpenChange={setShowAssignTenant}
          unit={null}
          onAssign={handleAssignTenant}
        />
      )}
    </>
  );
}
