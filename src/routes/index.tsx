import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { CreateCustomerPage } from '@/pages/customers/CreateCustomerPage';
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage';
import { EditCustomerPage } from '@/pages/customers/EditCustomerPage';
import { LoansPage } from '@/pages/loans/LoansPage';
import { CreateLoanPage } from '@/pages/loans/CreateLoanPage';
import { LoanDetailPage } from '@/pages/loans/LoanDetailPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { CreateUserPage } from '@/pages/users/CreateUserPage';
import { RolesPage } from '@/pages/roles/RolesPage';
import { ROUTES } from '@/utils/constants';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
            <Route path={ROUTES.CUSTOMER_CREATE} element={<CreateCustomerPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
            <Route path={ROUTES.LOANS} element={<LoansPage />} />
            <Route path={ROUTES.LOANS_CREATE} element={<CreateLoanPage />} />
            <Route path="/loans/:id" element={<LoanDetailPage />} />
            <Route path={ROUTES.USERS} element={<UsersPage />} />
            <Route path={ROUTES.USERS_CREATE} element={<CreateUserPage />} />
            <Route path={ROUTES.ROLES} element={<RolesPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
