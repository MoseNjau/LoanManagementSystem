import { useAuthStore } from '@/store/auth.store';
import { Permission } from '@/types/enums';

export const usePermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    canCreateCustomer: () => hasPermission(Permission.CREATE_CUSTOMER),
    canViewCustomer: () => hasPermission(Permission.VIEW_CUSTOMER),
    canEditCustomer: () => hasPermission(Permission.EDIT_CUSTOMER),
    canDeleteCustomer: () => hasPermission(Permission.DELETE_CUSTOMER),
    
    canCreateLoan: () => hasPermission(Permission.CREATE_LOAN),
    canViewLoan: () => hasPermission(Permission.VIEW_LOAN),
    canEditLoan: () => hasPermission(Permission.EDIT_LOAN),
    canDeleteLoan: () => hasPermission(Permission.DELETE_LOAN),
    canApproveLoan: () => hasPermission(Permission.APPROVE_LOAN),
    canDisburseLoan: () => hasPermission(Permission.DISBURSE_LOAN),
    
    canCreateUser: () => hasPermission(Permission.CREATE_USER),
    canViewUser: () => hasPermission(Permission.VIEW_USER),
    canEditUser: () => hasPermission(Permission.EDIT_USER),
    canDeleteUser: () => hasPermission(Permission.DELETE_USER),
    
    canManageRoles: () => hasPermission(Permission.MANAGE_ROLES),
    canManagePermissions: () => hasPermission(Permission.MANAGE_PERMISSIONS),
    
    canViewReports: () => hasPermission(Permission.VIEW_REPORTS),
    canExportData: () => hasPermission(Permission.EXPORT_DATA),
  };
};
