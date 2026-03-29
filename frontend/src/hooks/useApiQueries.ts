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

export const useProperties = () => {
  return useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => fetchJson('/api/v1/property'),
  });
};

export const useUnits = (propertyId?: string) => {
  return useQuery<Unit[]>({
    queryKey: ['units', propertyId],
    queryFn: () => fetchJson(`/api/v1/unit?propertyId=${propertyId}`),
    enabled: !!propertyId, // Only fetch if propertyId is provided
  });
};

export const useTenants = () => {
  return useQuery<any[]>({
    queryKey: ['tenants'],
    queryFn: () => fetchJson('/api/v1/tenant'),
  });
};
