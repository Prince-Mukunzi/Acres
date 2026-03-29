import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/utils/api';
import type { Communication } from '@/types/communication';
import type { Property } from '@/types/property';

// Common helper to throw on error responses
const fetchJsonWithThrow = async (url: string, options: RequestInit) => {
  const res = await fetchApi(url, options);
  if (!res.ok) throw new Error(`Mutation failed on ${url}`);
  try {
    return await res.json();
  } catch (e) {
    return {};
  }
};

export const useAddCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newComm: Partial<Communication>) =>
      fetchJsonWithThrow('/api/v1/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newComm.title, body: newComm.message }),
      }),
    onMutate: async (newComm) => {
      await queryClient.cancelQueries({ queryKey: ['communications'] });
      const previous = queryClient.getQueryData<Communication[]>(['communications']);
      
      // Optimistically update to the new value
      queryClient.setQueryData<Communication[]>(['communications'], (old) => [
        { id: 'temp-id', ...newComm } as Communication,
        ...(old || []),
      ]);
      return { previous };
    },
    onError: (_err, _newComm, context) => {
      queryClient.setQueryData(['communications'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
};

export const useDeleteCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJsonWithThrow(`/api/v1/communication/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['communications'] });
      const previous = queryClient.getQueryData<Communication[]>(['communications']);
      queryClient.setQueryData<Communication[]>(['communications'], (old) => 
        (old || []).filter((c) => c.id !== id)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['communications'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
};

export const useAddProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProp: Property) =>
      fetchJsonWithThrow('/api/v1/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      }),
    onMutate: async (newProp) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const previous = queryClient.getQueryData<Property[]>(['properties']);
      queryClient.setQueryData<Property[]>(['properties'], (old) => [
        { ...newProp, id: crypto.randomUUID() },
        ...(old || []),
      ]);
      return { previous };
    },
    onError: (_err, _newProp, context) => {
      queryClient.setQueryData(['properties'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useEditProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; name: string; address: string }) =>
      fetchJsonWithThrow(`/api/v1/property/${args.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: args.name, address: args.address }),
      }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const previous = queryClient.getQueryData<Property[]>(['properties']);
      queryClient.setQueryData<Property[]>(['properties'], (old) => 
        (old || []).map(p => p.id === args.id ? { ...p, name: args.name, address: args.address } : p)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['properties'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) =>
      fetchJsonWithThrow(`/api/v1/property/${propertyId}`, { method: 'DELETE' }),
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const previous = queryClient.getQueryData<Property[]>(['properties']);
      queryClient.setQueryData<Property[]>(['properties'], (old) => 
        (old || []).filter(p => p.id !== propertyId)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['properties'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useAddBulkUnits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { propertyId: string; units: any[] }) =>
      fetchJsonWithThrow('/api/v1/unit/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['units', args.propertyId] });
      const previous = queryClient.getQueryData<any[]>(['units', args.propertyId]);
      
      const optimisticUnits = args.units.map((u, i) => ({
        id: `temp-${Date.now()}-${i}`,
        name: u.unitName,
        rentAmount: `RWF ${Number(u.rentAmount).toLocaleString()}`,
        status: u.unitStatus === 'VACANT' ? 'Vacant' : 'Occupied',
        tenant: null,
      }));

      queryClient.setQueryData<any[]>(['units', args.propertyId], (old) => [
        ...(old || []),
        ...optimisticUnits,
      ]);
      return { previous };
    },
    onError: (_err, args, context) => {
      queryClient.setQueryData(['units', args.propertyId], context?.previous);
    },
    onSettled: (_data, _err, args) => {
      queryClient.invalidateQueries({ queryKey: ['units', args.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
};

export const useToggleTenantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; firstName: string; lastName: string; status: string }) =>
      fetchJsonWithThrow(`/api/v1/tenant/${args.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: args.firstName,
          lastName: args.lastName,
          status: args.status,
        }),
      }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['tenants'] });
      const previous = queryClient.getQueryData<any[]>(['tenants']);
      queryClient.setQueryData<any[]>(['tenants'], (old) => 
        (old || []).map(t => t.id === args.id ? { ...t, status: args.status } : t)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['tenants'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJsonWithThrow(`/api/v1/tenant/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tenants'] });
      const previous = queryClient.getQueryData<any[]>(['tenants']);
      queryClient.setQueryData<any[]>(['tenants'], (old) => 
        (old || []).filter(t => t.id !== id)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['tenants'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};
