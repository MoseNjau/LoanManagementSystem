import { UserRole, Permission } from '@/types/enums';

export const API_BASE_URL = '/api';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
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
  [UserRole.LOAN_OFFICER]: [
    Permission.CREATE_CUSTOMER,
    Permission.VIEW_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.CREATE_LOAN,
    Permission.VIEW_LOAN,
    Permission.EDIT_LOAN,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.READ_ONLY]: [
    Permission.VIEW_CUSTOMER,
    Permission.VIEW_LOAN,
    Permission.VIEW_USER,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.CUSTOMER]: [
    Permission.VIEW_CUSTOMER,
    Permission.VIEW_LOAN,
  ],
};

export const TOKEN_KEY = 'kassolend_access_token';
export const USER_KEY = 'kassolend_user';

export const QUERY_KEYS = {
  AUTH: ['auth'],
  CUSTOMERS: ['customers'],
  CUSTOMER: (id: number) => ['customer', id],
  LOANS: ['loans'],
  LOAN: (id: number) => ['loan', id],
  USERS: ['users'],
  USER: (id: number) => ['user', id],
  ROLES: ['roles'],
  DASHBOARD: ['dashboard'],
  LOAN_OFFICERS: ['loan-officers'],
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  CUSTOMER_CREATE: '/customers/create',
  CUSTOMER_DETAIL: (id: number) => `/customers/${id}`,
  CUSTOMER_EDIT: (id: number) => `/customers/${id}/edit`,
  LOANS: '/loans',
  LOANS_CREATE: '/loans/create',
  LOAN_DETAIL: (id: number) => `/loans/${id}`,
  USERS: '/users',
  USERS_CREATE: '/users/create',
  USER_DETAIL: (id: number) => `/users/${id}`,
  ROLES: '/roles',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  SORT_BY: 'createdAt',
  SORT_ORDER: 'desc' as const,
};

export const DATE_FORMAT = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
};
