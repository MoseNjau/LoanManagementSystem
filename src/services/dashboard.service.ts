import { httpClient } from './http-client';
import { DashboardStats } from '@/types';

export interface RecentLoan {
  loanId: number;
  customerName: string;
  loanReference: string;
  principalAmount: number;
  totalLoanAmount: number;
  loanStatus: string;
  disbursementDate: string;
  dateCreated: string;
}

export const dashboardService = {
  /**
   * Compute dashboard stats from real endpoints.
   * We fire parallel requests to /customers and /loans (with various filters)
   * then derive the KPI numbers client-side.
   */
  async getStats(): Promise<DashboardStats> {
    // Fire all requests in parallel for speed
    const [
      customersRes,
      allLoansRes,
      activeLoansRes,
      pendingLoansRes,
      defaultedLoansRes,
      loanOfficersRes,
    ] = await Promise.allSettled([
      httpClient.get<any>('/customers?page=0&size=1'),     // just need totalElements
      httpClient.get<any>('/loans?page=0&size=1'),         // all loans total
      httpClient.get<any>('/loans?loanStatus=ACTIVE&page=0&size=1'),
      httpClient.get<any>('/loans?loanStatus=PENDING&page=0&size=1'),
      httpClient.get<any>('/loans?loanStatus=DEFAULTED&page=0&size=1'),
      httpClient.get<any>('/loan-officers'),
    ]);

    const extractTotal = (result: PromiseSettledResult<any>): number => {
      if (result.status !== 'fulfilled') return 0;
      const res = result.value;
      // Spring Boot Page: { totalElements, content, ... }
      if (res?.totalElements !== undefined) return res.totalElements;
      // Array response
      if (Array.isArray(res)) return res.length;
      // Wrapped array  { data: [...] }
      if (Array.isArray(res?.content)) return res.totalElements || res.content.length;
      return 0;
    };

    // For total disbursed we need to sum principalAmount of all disbursed/active loans.
    // Fetch a larger page of active loans to compute this.
    let totalDisbursed = 0;
    try {
      const disbursedRes = await httpClient.get<any>('/loans?loanStatus=ACTIVE&page=0&size=1000');
      const loans = Array.isArray(disbursedRes)
        ? disbursedRes
        : (disbursedRes?.content || []);
      totalDisbursed = loans.reduce(
        (sum: number, loan: any) => sum + (loan.principalAmount || loan.totalLoanAmount || 0),
        0
      );
    } catch {
      // Silently fall back to 0
    }

    return {
      totalCustomers: extractTotal(customersRes),
      totalLoans: extractTotal(allLoansRes),
      activeLoans: extractTotal(activeLoansRes),
      totalDisbursed,
      pendingApprovals: extractTotal(pendingLoansRes),
      defaultedLoans: extractTotal(defaultedLoansRes),
      totalLoanOfficers: loanOfficersRes.status === 'fulfilled'
        ? (Array.isArray(loanOfficersRes.value) ? loanOfficersRes.value.length : 0)
        : 0,
    };
  },

  /**
   * Fetch the most recent loans to show as recent activity.
   */
  async getRecentLoans(): Promise<RecentLoan[]> {
    try {
      const response = await httpClient.get<any>('/loans?page=0&size=5');
      const loans = Array.isArray(response)
        ? response
        : (response?.content || []);
      return loans as RecentLoan[];
    } catch {
      return [];
    }
  },
};
