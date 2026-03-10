export interface Property {
  id?: string;
  name: string;
  address: string;
  units: number; // Todo: Assign unit type
  tenants: number; // Todo: Assign tenants type
  tickets: number; // Todo: Assign tickets type
  selected?: boolean;
  onClick?: () => void;
}
