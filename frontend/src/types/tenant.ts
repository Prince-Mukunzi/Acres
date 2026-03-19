export type TenantStatus = 'Paid' | 'Overdue';

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  unitId: string;
  status: TenantStatus;
  startDate?: string;
  endDate?: string;
}
