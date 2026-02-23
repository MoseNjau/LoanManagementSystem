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

    // Align exactly with Postman: customerId, page, size, loanReference, loanStatus, loanOfficerId, fromDate, toDate
    if (filters.customerId) params.append('customerId', filters.customerId.toString());
    if (filters.loanReference) params.append('loanReference', filters.loanReference);
    if (filters.loanStatus) params.append('loanStatus', filters.loanStatus);
    if (filters.loanOfficerId) params.append('loanOfficerId', filters.loanOfficerId.toString());
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    // Pagination — Spring Boot is 0-indexed
    params.append('page', (filters.page ?? 0).toString());
    params.append('size', (filters.size ?? 10).toString());

    const response = await httpClient.get<any>(`/loans?${params.toString()}`);

    // After httpClient.unwrapResponse(), the response is the inner "data" from
    // backend's { success, data, message } wrapper. For paginated endpoints this
    // is a Spring Boot Page: { content, totalElements, totalPages, number, size, ... }

    // Case 1: Spring Boot Page object (most common for GET /loans)
    if (response && response.content && Array.isArray(response.content)) {
      return {
        data: response.content,
        total: response.totalElements ?? response.content.length,
        page: response.number ?? 0,
        limit: response.size ?? filters.size ?? 10,
        totalPages: response.totalPages ?? Math.ceil((response.totalElements ?? response.content.length) / (response.size ?? filters.size ?? 10)),
      };
    }

    // Case 2: Backend returns a plain array (no pagination wrapper)
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: filters.page ?? 0,
        limit: filters.size ?? 10,
        totalPages: Math.ceil(response.length / (filters.size ?? 10)),
      };
    }

    // Case 3: Backend returns { data: [...], total, ... } format directly
    if (response && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.total ?? response.data.length,
        page: response.page ?? filters.page ?? 0,
        limit: response.limit ?? response.size ?? filters.size ?? 10,
        totalPages: response.totalPages ?? Math.ceil((response.total ?? response.data.length) / (response.limit ?? filters.size ?? 10)),
      };
    }

    // Fallback: return empty result
    console.warn('Unexpected loan response format:', response);
    return {
      data: [],
      total: 0,
      page: 0,
      limit: filters.size ?? 10,
      totalPages: 0,
    };
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
    return Array.isArray(response) ? response : (response.schedules || response.content || []);
  },

  async getLoanRepayments(loanId: number): Promise<LoanRepayment[]> {
    const response = await httpClient.get<any>(`/loans/${loanId}/repayments`);
    return Array.isArray(response) ? response : (response.repayments || response.content || []);
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
    return Array.isArray(response) ? response : [];
  },

  async getLoanSummary(loanReference: string): Promise<any> {
    const response = await httpClient.get<any>(`/loans?loanReference=${loanReference}`);
    // Handle both Page and array responses
    const list = Array.isArray(response)
      ? response
      : (response?.content || response?.data || []);
    return list[0] || null;
  },

  async getStatementRepayments(loanId: number): Promise<LoanRepayment[]> {
    const response = await httpClient.get<any>(`/loans/loan-repayments?loanId=${loanId}`);
    return Array.isArray(response) ? response : (response.data || response.content || []);
  },
};
