export interface Property {
  id: string;
  name: string;
  address: string;
  units?: number;
  tenants?: number;
  tickets?: number;
  selected?: boolean;
  owner_name?: string;
  onClick?: () => void;
}
