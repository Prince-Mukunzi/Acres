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
    mutationFn: (newComm: { tenantID?: string; unitID?: string; title: string; body: string }) =>
      fetchJsonWithThrow('/api/v1/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComm),
      }),
    onMutate: async (newComm) => {
      await queryClient.cancelQueries({ queryKey: ['communications'] });
      const previous = queryClient.getQueryData<Communication[]>(['communications']);
      
      // Optimistically update to the new value
      queryClient.setQueryData<Communication[]>(['communications'], (old) => [
        { id: 'temp-id', title: newComm.title, message: newComm.body } as unknown as Communication,
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
export const useToggleTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; isResolved: boolean }) =>
      fetchJsonWithThrow(`/api/v1/ticket/${args.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: args.isResolved }),
      }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previous = queryClient.getQueryData<any[]>(['tickets']);
      queryClient.setQueryData<any[]>(['tickets'], (old) =>
        (old || []).map((t) => (t.id === args.id ? { ...t, status: args.isResolved } : t))
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['tickets'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useEditTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; data: any }) =>
      fetchJsonWithThrow(`/api/v1/tenant/${args.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args.data),
      }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['tenants'] });
      const previous = queryClient.getQueryData<any[]>(['tenants']);
      queryClient.setQueryData<any[]>(['tenants'], (old) =>
        (old || []).map((t) => (t.id === args.id ? { ...t, ...args.data } : t))
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

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; propertyId: string; data: any }) =>
      fetchJsonWithThrow(`/api/v1/unit/${args.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...args.data, propertyId: args.propertyId }),
      }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['units', args.propertyId] });
      const previous = queryClient.getQueryData<any[]>(['units', args.propertyId]);
      queryClient.setQueryData<any[]>(['units', args.propertyId], (old) =>
        (old || []).map((u) => (u.id === args.id ? { ...u, ...args.data } : u))
      );
      return { previous };
    },
    onError: (_err, args, context) => {
      queryClient.setQueryData(['units', args.propertyId], context?.previous);
    },
    onSettled: (_data, _err, args) => {
      queryClient.invalidateQueries({ queryKey: ['units', args.propertyId] });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; propertyId: string }) =>
      fetchJsonWithThrow(`/api/v1/unit/${args.id}`, { method: 'DELETE' }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['units', args.propertyId] });
      const previous = queryClient.getQueryData<any[]>(['units', args.propertyId]);
      queryClient.setQueryData<any[]>(['units', args.propertyId], (old) =>
        (old || []).filter((u) => u.id !== args.id)
      );
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

export const useAssignTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { tenantData: any; unitData: any }) =>
      Promise.all([
        fetchJsonWithThrow('/api/v1/tenant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args.tenantData),
        }),
        fetchJsonWithThrow(`/api/v1/unit/${args.tenantData.unitID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args.unitData),
        }),
      ]),
    onMutate: async (args) => {
      const propertyId = args.unitData.propertyId;
      await queryClient.cancelQueries({ queryKey: ['units', propertyId] });
      await queryClient.cancelQueries({ queryKey: ['tenants'] });
      
      const previousUnits = queryClient.getQueryData<any[]>(['units', propertyId]);
      queryClient.setQueryData<any[]>(['units', propertyId], (old) =>
        (old || []).map((u) => u.id === args.tenantData.unitID ? { ...u, status: 'Occupied' } : u)
      );
      
      return { previousUnits };
    },
    onError: (_err, args, context) => {
      queryClient.setQueryData(['units', args.unitData.propertyId], context?.previousUnits);
    },
    onSettled: (_data, _err, args) => {
      queryClient.invalidateQueries({ queryKey: ['units', args.unitData.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
};

export const useToggleAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => fetchJsonWithThrow(`/api/v1/admin/users/${userId}/toggle-admin`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    },
  });
};

export const useToggleSuspend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => fetchJsonWithThrow(`/api/v1/admin/users/${userId}/toggle-suspend`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => fetchJsonWithThrow(`/api/v1/admin/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: (userId: string) => fetchJsonWithThrow(`/api/v1/admin/users/${userId}/impersonate`, { method: 'POST' }),
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; title: string; description: string; severity: string }) =>
      fetchJsonWithThrow('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });
};

export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status: string }) =>
      fetchJsonWithThrow(`/api/v1/admin/feedback/${args.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: args.status }),
      }),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'feedback'] });
      const previous = queryClient.getQueryData<any[]>(['admin', 'feedback']);
      queryClient.setQueryData<any[]>(['admin', 'feedback'], (old) =>
        (old || []).map((f) => (f.id === args.id ? { ...f, status: args.status } : f))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['admin', 'feedback'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJsonWithThrow(`/api/v1/admin/feedback/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'feedback'] });
      const previous = queryClient.getQueryData<any[]>(['admin', 'feedback']);
      queryClient.setQueryData<any[]>(['admin', 'feedback'], (old) =>
        (old || []).filter((f) => f.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['admin', 'feedback'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });
};
