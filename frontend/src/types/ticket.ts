export interface Ticket {
  id: string;
  unit: string;
  tenant: string; // Todo: change type to Tenant Type
  createdAt: string;
  body: string;
  status: boolean; // Todo: explore other status for scale
  onView?: () => void;
}
