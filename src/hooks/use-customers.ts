import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { customerService } from '@/services/customer.service';
import { CreateCustomerDTO, PaginationParams } from '@/types';
import { QUERY_KEYS } from '@/utils/constants';

export const useCustomers = (params?: Partial<PaginationParams>) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMERS, params],
    queryFn: () => customerService.getCustomers(params),
  });
};

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDTO) => customerService.createCustomer(data),
    onSuccess: () => {
      toast.success('Customer created successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create customer');
    }
  });
};

export const useUpdateCustomer = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateCustomerDTO>) => 
      customerService.updateCustomer(id, data),
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER(id) });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update customer');
    }
  });
};

export const useUpdateCustomerField = (customerId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { columnName: string; newValue: any; updatedBy: number }) => 
      customerService.updateCustomerField(customerId, payload),
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER(customerId) });
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update customer';
      toast.error(message);
    }
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerService.deleteCustomer(id),
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete customer');
    }
  });
};

export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMERS, 'search', query],
    queryFn: () => customerService.searchCustomers(query),
    enabled: query.length > 2,
  });
};
