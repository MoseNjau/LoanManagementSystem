import { httpClient } from './http-client';
import {
  CreateLoanDTO,
  LoanDetail,
  LoanSchedule,
  LoanRepayment,
  LoanCalculatorRequest,
  LoanCalculatorResponse,
  LoanTopUpRequest,
  LoanFilters,
  PaginatedResponse,
} from '@/types';

export const loanService = {
  async getLoans(filters: LoanFilters): Promise<PaginatedResponse<LoanDetail>> {
    const params = new URLSearchParams();
    
    if (filters.customerId) params.append('customerId', filters.customerId.toString());
    if (filters.loanReference) params.append('loanReference', filters.loanReference);
    if (filters.loanStatus) params.append('loanStatus', filters.loanStatus);
    if (filters.loanOfficerId) params.append('loanOfficerId', filters.loanOfficerId.toString());
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    
    params.append('page', (filters.page || 0).toString());
    params.append('size', (filters.size || 10).toString());

    const response = await httpClient.get<any>(`/loans?${params.toString()}`);
    
    // Handle backend response formats
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: filters.page || 0,
        limit: filters.size || 10,
        totalPages: 1,
      };
    }
    
    // Handle Spring Boot Page structure
    if (response.content && Array.isArray(response.content)) {
      return {
        data: response.content,
        total: response.totalElements || response.content.length,
        page: response.number || 0,
        limit: response.size || 10,
        totalPages: response.totalPages || 1,
      };
    }
    
    return response as PaginatedResponse<LoanDetail>;
  },

  async getLoanById(id: number): Promise<LoanDetail> {
    const response = await httpClient.get<LoanDetail>(`/loans/${id}`);
    return response;
  },

  async createLoan(data: CreateLoanDTO): Promise<LoanDetail> {
    const response = await httpClient.post<LoanDetail>('/loans', data);
    return response;
  },

  async getLoanSchedules(loanId: number): Promise<LoanSchedule[]> {
    const response = await httpClient.get<any>(`/loans/${loanId}/schedules`);
    return Array.isArray(response) ? response : (response.schedules || []);
  },

  async getLoanRepayments(loanId: number): Promise<LoanRepayment[]> {
    const response = await httpClient.get<any>(`/loans/${loanId}/repayments`);
    return Array.isArray(response) ? response : (response.repayments || []);
  },

  async calculateLoan(data: LoanCalculatorRequest): Promise<LoanCalculatorResponse> {
    const response = await httpClient.post<LoanCalculatorResponse>(
      '/loan-calculator/installment',
      data
    );
    return response;
  },

  async calculateTopUp(data: LoanTopUpRequest): Promise<LoanCalculatorResponse> {
    const response = await httpClient.post<LoanCalculatorResponse>(
      '/loan-calculator/top-up',
      data
    );
    return response;
  },

  async getCustomerActiveLoans(customerId: number): Promise<LoanDetail[]> {
    const response = await httpClient.get<LoanDetail[]>(`/customers/${customerId}/active-loans`);
    return response;
  },

  async getLoanSummary(loanReference: string): Promise<any> {
    const response = await httpClient.get<any>(`/loans?loanReference=${loanReference}`);
    // The endpoint returns a list (wrapped or not), we take the first item
    const list = Array.isArray(response) ? response : (response.data || response.content || []);
    return list[0] || null;
  },

  async getStatementRepayments(loanId: number): Promise<LoanRepayment[]> {
    const response = await httpClient.get<any>(`/loans/loan-repayments?loanId=${loanId}`);
    return Array.isArray(response) ? response : (response.data || []);
  },
};
