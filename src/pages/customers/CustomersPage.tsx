import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '@/hooks/use-customers';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatPhoneNumber } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

export const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  
  // Debounce search could be added here, but for now direct state pass
  const { data, isLoading } = useCustomers({ page, limit: 10, status, search });
  const { canCreateCustomer } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const customers = data?.data || [];
  const hasCustomers = customers.length > 0;

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'BLOCKED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactive</span>;
      case 'BLACKLISTED':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Blacklisted</span>;
      default:
        return status ? <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span> : null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">
            Manage all customer information and records
          </p>
        </div>
        {canCreateCustomer() && (
          <Link to={ROUTES.CUSTOMER_CREATE}>
            <Button variant="primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="search"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Inactive</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!hasCustomers ? (
            <EmptyState
              title="No customers found"
              description="Get started by adding your first customer"
              action={
                canCreateCustomer() && (
                  <Link to={ROUTES.CUSTOMER_CREATE}>
                    <Button variant="primary">Add First Customer</Button>
                  </Link>
                )
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.customerId || customer.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm mr-3">
                            {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.fullName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>{customer.idNumber}</TableCell>
                      <TableCell>{formatPhoneNumber(customer.phoneNumber)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.emailAddress}</span>
                      </TableCell>
                      <TableCell>{customer.townOrArea}</TableCell>
                      <TableCell>
                        {(customer.dateCreated || customer.createdAt) ? formatDate(customer.dateCreated || customer.createdAt!, 'short') : '-'}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/customers/${customer.customerId || customer.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.total)} of {data.total} customers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
