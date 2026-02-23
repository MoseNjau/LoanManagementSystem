import { create } from 'zustand';
import { User } from '@/types';
import { UserRole, Permission } from '@/types/enums';
import { authService } from '@/services/auth.service';
import { ROLE_PERMISSIONS, TOKEN_KEY } from '@/utils/constants';

/**
 * Check if the stored JWT token has expired.
 * Returns true if the token is expired or missing.
 */
function isTokenExpired(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false; // not a standard JWT

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false; // no exp claim

    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;

    return user.permissions.includes(permission) ||
      ROLE_PERMISSIONS[user.role]?.includes(permission) ||
      false;
  },

  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },

  hasAnyPermission: (permissions) => {
    return permissions.some(permission => get().hasPermission(permission));
  },

  hasAllPermissions: (permissions) => {
    return permissions.every(permission => get().hasPermission(permission));
  },

  initialize: () => {
    const storedUser = authService.getStoredUser();
    const hasToken = authService.isAuthenticated();

    // If the token has expired, clear everything and force re-login
    if (hasToken && isTokenExpired()) {
      console.warn('Token has expired. Clearing session.');
      authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({
      user: storedUser,
      isAuthenticated: hasToken && !!storedUser,
      isLoading: false,
    });
  },
}));
