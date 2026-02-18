import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/types/enums';
import { ROUTES } from '@/utils/constants';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export const PermissionGuard = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
}: PermissionGuardProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasAccess = () => {
    if (permission) {
      return hasPermission(permission);
    }

    if (permissions) {
      return requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    return true;
  };

  if (!hasAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
