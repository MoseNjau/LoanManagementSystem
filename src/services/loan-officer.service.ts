import { httpClient } from './http-client';
import { LoanOfficer, CreateLoanOfficerDTO } from '@/types';

export const loanOfficerService = {
  async getLoanOfficers(): Promise<LoanOfficer[]> {
    const response = await httpClient.get<LoanOfficer[]>('/loan-officers');
    return response;
  },

  async getLoanOfficerById(id: number): Promise<LoanOfficer> {
    const response = await httpClient.get<LoanOfficer>(`/loan-officers/${id}`);
    return response;
  },

  async createLoanOfficer(data: CreateLoanOfficerDTO): Promise<LoanOfficer> {
    const response = await httpClient.post<LoanOfficer>('/loan-officers', data);
    return response;
  },
};
