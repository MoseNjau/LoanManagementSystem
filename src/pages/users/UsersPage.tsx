import { Link } from 'react-router-dom';
import { useLoanOfficers } from '@/hooks/use-loan-officers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

export const UsersPage = () => {
  const { data: loanOfficers, isLoading, error } = useLoanOfficers();

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load loan officers. Please try again.</p>
      </div>
    );
  }

  const officers = loanOfficers || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Officers</h1>
          <p className="text-gray-600 mt-1">Manage loan officers and field staff</p>
        </div>
        <Link to={ROUTES.USERS_CREATE}>
          <Button>+ Add Loan Officer</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Officers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{officers.length}</p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Officers</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {officers.filter((o) => o.active || o.isActive).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers Managed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {officers.reduce((sum, o) => sum + (o.customersCount || 0), 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Officers Table */}
      {officers.length === 0 ? (
        <EmptyState
          title="No loan officers found"
          description="Get started by adding your first loan officer"
          action={
            <Link to={ROUTES.USERS_CREATE}>
              <Button>+ Add Loan Officer</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Loans</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {officers.map((officer) => (
                <TableRow key={officer.loanOfficerId || officer.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {officer.firstName.charAt(0)}{officer.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium">
                          {officer.fullName || `${officer.firstName} ${officer.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500">{officer.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{officer.email || '-'}</TableCell>
                  <TableCell>{officer.phoneNumber}</TableCell>
                  <TableCell>{officer.customersCount || 0}</TableCell>
                  <TableCell>{officer.loansCount || 0}</TableCell>
                  <TableCell>
                    {(officer.active || officer.isActive) ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {(officer.dateCreated || officer.createdAt) ? formatDate(officer.dateCreated || officer.createdAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <button className="text-primary-600 hover:text-primary-800">View Details</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
