export interface Property {
  id: string;
  name: string;
  address: string;
  units?: number; // Todo: calculate unit func
  tenants?: number; // Todo: calculate tenants func
  tickets?: number; // Todo: calculate tickets func
  selected?: boolean;
  onClick?: () => void;
}
