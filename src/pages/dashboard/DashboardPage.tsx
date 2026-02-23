import { Link } from 'react-router-dom';
import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </CardContent>
  </Card>
);

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-success-100 text-success-700',
  PENDING: 'bg-warning-100 text-warning-700',
  DEFAULTED: 'bg-error-100 text-error-700',
  CLOSED: 'bg-gray-100 text-gray-700',
  DISBURSED: 'bg-primary-100 text-primary-700',
  APPROVED: 'bg-blue-100 text-blue-700',
};

export const DashboardPage = () => {
  const { stats, recentLoans, isLoading, hasError } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'bg-primary-500',
    },
    {
      title: 'Total Loans',
      value: stats?.totalLoans ?? 0,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-secondary-500',
    },
    {
      title: 'Active Loans',
      value: stats?.activeLoans ?? 0,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-success-500',
    },
    {
      title: 'Total Disbursed',
      value: formatCurrency(stats?.totalDisbursed ?? 0),
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-warning-500',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals ?? 0,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-primary-400',
    },
    {
      title: 'Defaulted Loans',
      value: stats?.defaultedLoans ?? 0,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: 'bg-error-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your loan management system
        </p>
      </div>

      {hasError && (
        <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <p className="text-sm text-warning-700">
            Some dashboard data could not be loaded. Showing available data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                to={ROUTES.CUSTOMER_CREATE}
                className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="p-2 bg-primary-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Add New Customer</p>
                  <p className="text-sm text-gray-600">Register a new customer in the system</p>
                </div>
              </Link>

              <Link
                to={ROUTES.LOANS_CREATE}
                className="flex items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <div className="p-2 bg-secondary-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Create New Loan</p>
                  <p className="text-sm text-gray-600">Start a new loan application</p>
                </div>
              </Link>

              <Link
                to={ROUTES.CUSTOMERS}
                className="flex items-center p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
              >
                <div className="p-2 bg-success-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">View All Customers</p>
                  <p className="text-sm text-gray-600">Browse and manage customer records</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Loans</h3>
              <Link
                to={ROUTES.LOANS}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentLoans.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No loans found yet</p>
                <Link
                  to={ROUTES.LOANS_CREATE}
                  className="mt-3 inline-flex text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Create your first loan →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLoans.map((loan) => (
                  <Link
                    key={loan.loanId}
                    to={`/loans/${loan.loanId}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {loan.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.loanReference} • {formatDate(loan.dateCreated || loan.disbursementDate, 'short')}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(loan.principalAmount)}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[loan.loanStatus] || 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {loan.loanStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
