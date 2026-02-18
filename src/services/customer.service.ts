import { httpClient } from './http-client';
import { Customer, CreateCustomerDTO, PaginatedResponse, PaginationParams } from '@/types';

export const customerService = {
  async getCustomers(params?: Partial<PaginationParams>): Promise<PaginatedResponse<Customer>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString()); // Backend uses 'size' not 'limit'
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status && params.status !== 'All Status') queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get<any>(url);
    
    // Handle backend response - might be array or paginated object
    if (Array.isArray(response)) {
      // Backend returns array directly
      return {
        data: response,
        total: response.length,
        page: params?.page || 0,
        limit: params?.limit || response.length,
        totalPages: 1,
      };
    }
    
    // Handle Spring Boot Page structure: {content: [], totalElements, number, size, totalPages}
    if (response.content && Array.isArray(response.content)) {
      return {
        data: response.content,
        total: response.totalElements || response.content.length,
        page: response.number || 0,
        limit: response.size || 10,
        totalPages: response.totalPages || 1,
      };
    }
    
    // If already in correct format
    return response as PaginatedResponse<Customer>;
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
