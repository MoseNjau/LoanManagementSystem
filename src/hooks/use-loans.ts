import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { loanService } from '@/services/loan.service';
import {
  CreateLoanDTO,
  LoanFilters,
  LoanCalculatorRequest,
  LoanTopUpRequest,
} from '@/types';

export const useLoans = (filters: LoanFilters) => {
  return useQuery({
    queryKey: ['loans', filters],
    queryFn: () => loanService.getLoans(filters),
  });
};

export const useLoan = (id: number) => {
  return useQuery({
    queryKey: ['loan', id],
    queryFn: () => loanService.getLoanById(id),
    enabled: !!id,
  });
};

export const useLoanSchedules = (loanId: number) => {
  return useQuery({
    queryKey: ['loan-schedules', loanId],
    queryFn: () => loanService.getLoanSchedules(loanId),
    enabled: !!loanId,
  });
};

export const useLoanRepayments = (loanId: number) => {
  return useQuery({
    queryKey: ['loan-repayments', loanId],
    queryFn: () => loanService.getLoanRepayments(loanId),
    enabled: !!loanId,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanDTO) => loanService.createLoan(data),
    onSuccess: () => {
      toast.success('Loan created successfully');
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create loan');
    },
  });
};

export const useLoanCalculator = () => {
  return useMutation({
    mutationFn: (data: LoanCalculatorRequest) => loanService.calculateLoan(data),
  });
};

export const useLoanTopUpCalculator = () => {
  return useMutation({
    mutationFn: (data: LoanTopUpRequest) => loanService.calculateTopUp(data),
  });
};

export const useCustomerActiveLoans = (customerId: number) => {
  return useQuery({
    queryKey: ['customer-active-loans', customerId],
    queryFn: () => loanService.getCustomerActiveLoans(customerId),
    enabled: !!customerId,
  });
};
