import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { LoginCredentials } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { QUERY_KEYS } from '@/utils/constants';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, setError, logout: logoutStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: QUERY_KEYS.AUTH,
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    currentUser,
    isLoadingUser,
  };
};
