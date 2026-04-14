export interface Unit {
  id: string;
  name: string;
  rentAmount: string;
  status: "Vacant" | "Occupied";
  tenant: string | null;
  propertyId?: string;
}
