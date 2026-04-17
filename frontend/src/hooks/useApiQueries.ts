import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/utils/api';
import type { Property } from '@/types/property';
import type { Unit } from '@/types/unit';
import type { Ticket } from '@/types/ticket';
import type { Communication } from '@/types/communication';

// Generic fetcher
export const fetchJson = async (url: string) => {
  const res = await fetchApi(url);
  if (!res.ok) throw new Error(`Error fetching ${url}`);
  return res.json();
};

const cacheOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => fetchJson('/api/v1/stats'),
    ...cacheOptions,
  });
};

export const useDashboardChart = () => {
  return useQuery({
    queryKey: ['stats', 'chart'],
    queryFn: () => fetchJson('/api/v1/stats/chart'),
    ...cacheOptions,
  });
};

export const useTickets = (queueOnly = false) => {
  const url = queueOnly ? '/api/v1/ticket/queue' : '/api/v1/ticket';
  return useQuery<Ticket[]>({
    queryKey: ['tickets', { queueOnly }],
    queryFn: () => fetchJson(url),
    ...cacheOptions,
  });
};

export const useCommunications = () => {
  return useQuery<Communication[]>({
    queryKey: ['communications'],
    queryFn: () => fetchJson('/api/v1/communication'),
    ...cacheOptions,
  });
};

export const useSmsTemplates = () => {
  return useQuery<any[]>({
    queryKey: ['smsTemplates'],
    queryFn: () => fetchJson('/api/v1/communication-templates'),
    ...cacheOptions,
  });
};

export const useProperties = (page: number = 1, search: string = '') => {
  return useQuery<Property[]>({
    queryKey: ['properties', page, search],
    queryFn: () => fetchJson(`/api/v1/property?page=${page}&limit=50&search=${search}`),
    ...cacheOptions,
  });
};

export const useUnits = (propertyId?: string) => {
  return useQuery<Unit[]>({
    queryKey: ['units', propertyId],
    queryFn: () => fetchJson(`/api/v1/unit?propertyId=${propertyId}`),
    enabled: !!propertyId, // Only fetch if propertyId is provided
    ...cacheOptions,
  });
};

export const useTenants = (page: number = 1, search: string = '') => {
  return useQuery<any[]>({
    queryKey: ['tenants', page, search],
    queryFn: () => fetchJson(`/api/v1/tenant?page=${page}&limit=50&search=${search}`),
    ...cacheOptions,
  });
};

export const useTenantPayments = (tenantId?: string) => {
  return useQuery<any[]>({
    queryKey: ['tenantPayments', tenantId],
    queryFn: () => fetchJson(`/api/v1/tenant/${tenantId}/payments`),
    enabled: !!tenantId,
    ...cacheOptions,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetchJson('/api/v1/admin/stats'),
    ...cacheOptions,
  });
};

export const useAdminUsers = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => fetchJson('/api/v1/admin/users'),
    ...cacheOptions,
  });
};

export const useAdminRecentActivity = () => {
  return useQuery<any>({
    queryKey: ['admin', 'recent-activity'],
    queryFn: () => fetchJson('/api/v1/admin/recent-activity'),
    ...cacheOptions,
  });
};

export const useAdminCommunications = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'communications'],
    queryFn: () => fetchJson('/api/v1/admin/communications'),
    ...cacheOptions,
  });
};

export const useAdminOverviewStats = () => {
  return useQuery<any>({
    queryKey: ['admin', 'overview-stats'],
    queryFn: () => fetchJson('/api/v1/admin/overview-stats'),
    ...cacheOptions,
  });
};

export const useAdminTickets = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'tickets'],
    queryFn: () => fetchJson('/api/v1/admin/tickets'),
    ...cacheOptions,
  });
};

export const useAdminProperties = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'properties'],
    queryFn: () => fetchJson('/api/v1/admin/properties'),
    ...cacheOptions,
  });
};

export const useAdminFeedback = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'feedback'],
    queryFn: () => fetchJson('/api/v1/admin/feedback'),
    ...cacheOptions,
  });
};

export const useAdminCommunicationStats = () => {
  return useQuery<any>({
    queryKey: ['admin', 'communication-stats'],
    queryFn: () => fetchJson('/api/v1/admin/communication-stats'),
    ...cacheOptions,
  });
};
