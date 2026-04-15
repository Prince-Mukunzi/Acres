import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProperties } from "@/hooks/useApiQueries";
import { useAddProperty, useAddBulkUnits } from "@/hooks/useApiMutations";
import { AddProperty } from "./features/properties/PropertyForm";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types/property";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function OnboardingGuard() {
  const { data: propertiesList, isLoading, isFetching } = useProperties(1, "");
  const addPropertyMutation = useAddProperty();
  const bulkUnitsMutation = useAddBulkUnits();
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  const handleAddProperty = async (
    newProperty: Property,
    unitSeed?: { label: string; count: number; amount: string },
  ) => {
    addPropertyMutation.mutate(newProperty, {
      onSuccess: async (data: any) => {
        if (unitSeed && unitSeed.count > 0) {
          const seedUnits = Array.from(
            { length: unitSeed.count },
            (_, i) => ({
              unitName: `${unitSeed.label} ${i + 1}`,
              rentAmount: parseInt(unitSeed.amount.replace(/\D/g, "")) || 0,
              unitStatus: "VACANT",
            })
          );
          
          bulkUnitsMutation.mutate({
            propertyId: data.id,
            units: seedUnits,
          });
        }
      }
    });
  };

  // Show loading spinner while data hasn't been resolved yet
  if (isLoading || isFetching || propertiesList === undefined) {
    return (
      <div className="flex bg-background h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (propertiesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-10 w-10" strokeWidth={1.5} />
          </div>

          {/* Copy */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              No properties yet
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              Get started by creating your first property. You'll be able to manage units, tenants, and maintenance tickets once it's set up.
            </p>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="gap-2"
            onClick={() => setIsAddPropertyOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Create your first property
          </Button>
        </div>

        <AddProperty
          open={isAddPropertyOpen}
          onOpenChange={setIsAddPropertyOpen}
          onAdd={handleAddProperty}
        />
      </div>
    );
  }

  return <Outlet />;
}
