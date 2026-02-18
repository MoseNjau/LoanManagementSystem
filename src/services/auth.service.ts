import { httpClient } from './http-client';
import { LoginCredentials, LoginResponse, User } from '@/types';
import { TOKEN_KEY, USER_KEY } from '@/utils/constants';
import { UserRole, Permission } from '@/types/enums';

export type UserType = 'admin' | 'loan-officer';

// 🧪 DEV MODE: Set to true to use dummy user (bypasses real API)
const DEV_MODE = false;

// 🧪 Dummy user for development/testing
const DUMMY_USER: User = {
  id: 1,
  username: 'admin@demo.com',
  email: 'admin@demo.com',
  firstName: 'Demo',
  lastName: 'Admin',
  role: UserRole.ADMIN,
  permissions: [
    Permission.CREATE_CUSTOMER,
    Permission.VIEW_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.DELETE_CUSTOMER,
    Permission.CREATE_LOAN,
    Permission.VIEW_LOAN,
    Permission.EDIT_LOAN,
    Permission.DELETE_LOAN,
    Permission.APPROVE_LOAN,
    Permission.DISBURSE_LOAN,
    Permission.CREATE_USER,
    Permission.VIEW_USER,
    Permission.EDIT_USER,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const authService = {
  async login(credentials: LoginCredentials, userType: UserType = 'admin'): Promise<LoginResponse> {
    // 🧪 DEV MODE: Bypass API and use dummy user
    if (DEV_MODE) {
      // Validate demo credentials
      if (credentials.username === 'demo' && credentials.password === 'demo123') {
        const dummyTokens = {
          accessToken: 'dummy-access-token-' + Date.now(),
          refreshToken: 'dummy-refresh-token-' + Date.now(),
        };

        localStorage.setItem(TOKEN_KEY, dummyTokens.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(DUMMY_USER));

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
          tokens: dummyTokens,
          user: DUMMY_USER,
        };
      } else {
        // Wrong credentials in dev mode
        await new Promise(resolve => setTimeout(resolve, 500));
        throw new Error('Invalid credentials. Use: demo / demo123');
      }
    }

    // Real API call - route to appropriate endpoint based on user type
    let endpoint = '/auth/signin'; // Default for admin
    
    if (userType === 'loan-officer') {
      endpoint = '/loan-officers/login';
    }
    
    const response = await httpClient.post<any>(endpoint, credentials);
    
    console.log('Login response:', response);
    
    // Backend returns: { data: { token, userID, username, roles, ... }, message, success }
    // But httpClient now unwraps it, so we get: { token, userID, username, roles, ... }
    if (!response || !response.token) {
      throw new Error('Invalid response from server');
    }
    
    // Extract token
    const accessToken = response.token;
    
    // Determine user role based on response or userType
    let userRole: UserRole;
    if (response.role) {
      // Backend provides explicit role field
      userRole = response.role as UserRole;
    } else if (response.roles && response.roles.length > 0) {
      // Backend provides roles array
      userRole = response.roles[0] as UserRole;
    } else {
      // Fallback to userType parameter
      userRole = userType === 'admin' ? UserRole.ADMIN : UserRole.LOAN_OFFICER;
    }
    
    // CRITICAL FIX: The backend manages customers separately (mobile app).
    // If we are logging into the Web Portal, we are NEVER a customer.
    // If the backend returns 'CUSTOMER' (e.g. reused ID or default), we override it
    // with the intended login type (Admin or Loan Officer).
    if ((userRole as string).toUpperCase() === 'CUSTOMER') {
      console.warn('Backend returned CUSTOMER role for web portal login. Overriding to:', userType);
      userRole = userType === 'admin' ? UserRole.ADMIN : UserRole.LOAN_OFFICER;
    }

    console.log('Determined user role:', userRole, 'from userType:', userType);
    
    // Map backend user data to frontend User format
    const user: User = {
      id: response.userID || response.userId || 0,
      username: response.username,
      email: response.email || response.username,
      firstName: response.firstName || response.username,
      lastName: response.lastName || '',
      role: userRole,
      permissions: response.permissions || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store token and user data (no refresh token from backend)
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    console.log('Login successful, user:', user);
    
    return {
      tokens: { accessToken, refreshToken: accessToken }, // Use same token for compatibility
      user,
    };
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  async getCurrentUser(): Promise<User> {
    return httpClient.get<User>('/auth/me');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
