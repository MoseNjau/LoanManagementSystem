import { httpClient } from './http-client';
import { Customer, CreateCustomerDTO, PaginatedResponse, PaginationParams } from '@/types';

export const customerService = {
  async getCustomers(params?: Partial<PaginationParams>): Promise<PaginatedResponse<Customer>> {
    const queryParams = new URLSearchParams();

    // Backend uses 0-indexed pages and 'size' (not 'limit')
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status && params.status !== 'All Status') queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get<any>(url);

    const pageSize = params?.limit || 10;

    // Case 1: Spring Boot Page structure: {content, totalElements, number, size, totalPages}
    if (response && response.content && Array.isArray(response.content)) {
      return {
        data: response.content,
        total: response.totalElements ?? response.content.length,
        page: response.number ?? 0,
        limit: response.size ?? pageSize,
        totalPages: response.totalPages ?? Math.ceil((response.totalElements ?? response.content.length) / (response.size ?? pageSize)),
      };
    }

    // Case 2: Backend returns array directly (no pagination wrapper)
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: params?.page ?? 0,
        limit: pageSize,
        totalPages: Math.ceil(response.length / pageSize),
      };
    }

    // Case 3: Already in { data, total, ... } format
    if (response && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.total ?? response.data.length,
        page: response.page ?? params?.page ?? 0,
        limit: response.limit ?? response.size ?? pageSize,
        totalPages: response.totalPages ?? Math.ceil((response.total ?? response.data.length) / (response.limit ?? pageSize)),
      };
    }

    // Fallback
    console.warn('Unexpected customer response format:', response);
    return {
      data: [],
      total: 0,
      page: 0,
      limit: pageSize,
      totalPages: 0,
    };
  },

  async getCustomer(id: number): Promise<Customer> {
    return httpClient.get<Customer>(`/customers/${id}`);
  },

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    return httpClient.post<Customer>('/customers', data);
  },

  async updateCustomer(id: number, data: Partial<CreateCustomerDTO>): Promise<Customer> {
    return httpClient.put<Customer>(`/customers/${id}`, data);
  },

  async updateCustomerField(id: number, payload: { columnName: string; newValue: any; updatedBy: number }): Promise<void> {
    return httpClient.post<void>(`/customers/${id}/update-field`, payload);
  },

  async deleteCustomer(id: number): Promise<void> {
    return httpClient.delete<void>(`/customers/${id}`);
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    return httpClient.get<Customer[]>(`/customers/search?q=${encodeURIComponent(query)}`);
  },

  async changePassword(data: { idNumber: string; oldPassword: string; newPassword: string }): Promise<void> {
    return httpClient.post<void>('/customers/change-password', data);
  },
};
