import { create } from 'zustand';
import { User } from '@/types';
import { UserRole, Permission } from '@/types/enums';
import { authService } from '@/services/auth.service';
import { ROLE_PERMISSIONS } from '@/utils/constants';

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
    const isAuthenticated = authService.isAuthenticated();
    
    set({
      user: storedUser,
      isAuthenticated,
      isLoading: false,
    });
  },
}));
