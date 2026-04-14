import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProperties } from "@/hooks/useApiQueries";
import { useAddProperty, useAddBulkUnits } from "@/hooks/useApiMutations";
import { AddProperty } from "./features/properties/PropertyForm";
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
  const { data: propertiesList = [], isLoading } = useProperties(1, "");
  const addPropertyMutation = useAddProperty();
  const bulkUnitsMutation = useAddBulkUnits();

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

  if (isLoading) {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative z-50">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create Your First Property</h1>
            <p className="text-muted-foreground">
              Welcome to Acres! To get started managing your real estate, you'll need to set up your first property.
            </p>
          </div>
          
          <div className="flex justify-center pt-4">
            <AddProperty
              open={true}
              onOpenChange={() => {}} // Force it to remain open if clicked outside
              onAdd={handleAddProperty}
            />
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
