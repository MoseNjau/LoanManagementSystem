import { httpClient } from './http-client';
import { DashboardStats } from '@/types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return httpClient.get<DashboardStats>('/dashboard/stats');
  },

  async getRecentActivities(): Promise<unknown[]> {
    return httpClient.get<unknown[]>('/dashboard/activities');
  },
};
