import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/utils/constants';

export const useDashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'activities'],
    queryFn: () => dashboardService.getRecentActivities(),
  });

  return {
    stats,
    activities,
    isLoading: isLoadingStats || isLoadingActivities,
  };
};
