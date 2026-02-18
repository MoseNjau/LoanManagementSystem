import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { loanOfficerService } from '@/services/loan-officer.service';
import { CreateLoanOfficerDTO } from '@/types';

export const useLoanOfficers = () => {
  return useQuery({
    queryKey: ['loan-officers'],
    queryFn: () => loanOfficerService.getLoanOfficers(),
  });
};

export const useLoanOfficer = (id: number) => {
  return useQuery({
    queryKey: ['loan-officer', id],
    queryFn: () => loanOfficerService.getLoanOfficerById(id),
    enabled: !!id,
  });
};

export const useCreateLoanOfficer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanOfficerDTO) => loanOfficerService.createLoanOfficer(data),
    onSuccess: () => {
      toast.success('Loan officer created successfully');
      queryClient.invalidateQueries({ queryKey: ['loan-officers'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create loan officer');
    }
  });
};
