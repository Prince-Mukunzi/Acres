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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => fetchJson('/api/v1/stats'),
  });
};

export const useDashboardChart = () => {
  return useQuery({
    queryKey: ['stats', 'chart'],
    queryFn: () => fetchJson('/api/v1/stats/chart'),
  });
};

export const useTickets = (queueOnly = false) => {
  const url = queueOnly ? '/api/v1/ticket/queue' : '/api/v1/ticket';
  return useQuery<Ticket[]>({
    queryKey: ['tickets', { queueOnly }],
    queryFn: () => fetchJson(url),
  });
};

export const useCommunications = () => {
  return useQuery<Communication[]>({
    queryKey: ['communications'],
    queryFn: () => fetchJson('/api/v1/communication'),
  });
};

export const useProperties = (page: number = 1, search: string = '') => {
  return useQuery<Property[]>({
    queryKey: ['properties', page, search],
    queryFn: () => fetchJson(`/api/v1/property?page=${page}&limit=50&search=${search}`),
  });
};

export const useUnits = (propertyId?: string) => {
  return useQuery<Unit[]>({
    queryKey: ['units', propertyId],
    queryFn: () => fetchJson(`/api/v1/unit?propertyId=${propertyId}`),
    enabled: !!propertyId, // Only fetch if propertyId is provided
  });
};

export const useTenants = (page: number = 1, search: string = '') => {
  return useQuery<any[]>({
    queryKey: ['tenants', page, search],
    queryFn: () => fetchJson(`/api/v1/tenant?page=${page}&limit=50&search=${search}`),
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetchJson('/api/v1/admin/stats'),
  });
};

export const useAdminUsers = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => fetchJson('/api/v1/admin/users'),
  });
};

export const useAdminRecentActivity = () => {
  return useQuery<any>({
    queryKey: ['admin', 'recent-activity'],
    queryFn: () => fetchJson('/api/v1/admin/recent-activity'),
  });
};

export const useAdminCommunications = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'communications'],
    queryFn: () => fetchJson('/api/v1/admin/communications'),
  });
};

export const useAdminOverviewStats = () => {
  return useQuery<any>({
    queryKey: ['admin', 'overview-stats'],
    queryFn: () => fetchJson('/api/v1/admin/overview-stats'),
  });
};

export const useAdminTickets = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'tickets'],
    queryFn: () => fetchJson('/api/v1/admin/tickets'),
  });
};

export const useAdminProperties = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'properties'],
    queryFn: () => fetchJson('/api/v1/admin/properties'),
  });
};

export const useAdminFeedback = () => {
  return useQuery<any[]>({
    queryKey: ['admin', 'feedback'],
    queryFn: () => fetchJson('/api/v1/admin/feedback'),
  });
};
