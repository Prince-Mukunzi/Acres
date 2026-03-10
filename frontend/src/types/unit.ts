export interface Unit {
  name: string;
  rentAmount: string;
  status: "Vacant" | "Occupied";
  tenant: string | null;
}
