import { useQuery } from '@tanstack/react-query';
import { dashboardService, RecentLoan } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/utils/constants';
import { DashboardStats } from '@/types';

export const useDashboard = () => {
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery<DashboardStats>({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 min
    refetchOnWindowFocus: true,
  });

  const {
    data: recentLoans,
    isLoading: isLoadingRecent,
    error: recentError,
  } = useQuery<RecentLoan[]>({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'recent-loans'],
    queryFn: () => dashboardService.getRecentLoans(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    stats,
    recentLoans: recentLoans || [],
    isLoading: isLoadingStats || isLoadingRecent,
    hasError: !!statsError || !!recentError,
  };
};
