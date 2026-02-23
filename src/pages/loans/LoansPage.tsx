import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLoans } from '@/hooks/use-loans';
import { useLoanOfficers } from '@/hooks/use-loan-officers';
import { customerService } from '@/services/customer.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoanStatus, LoanFilters as LoanFiltersType, Customer } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

/**
 * Inline customer search component — typeahead with debounced API calls.
 * Shows matching customers as you type (min 2 chars).
 */
const CustomerSearch = ({
  value,
  onChange,
}: {
  value: { id: number; name: string } | null;
  onChange: (customer: { id: number; name: string } | null) => void;
}) => {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await customerService.getCustomers({ search: searchTerm, page: 0, limit: 10 });
      setResults(response.data || []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    // If user clears the input, clear the selection
    if (!val) {
      onChange(null);
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Debounce the API call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCustomers(val), 300);
  };

  const handleSelect = (customer: Customer) => {
    const name = customer.fullName || `${customer.firstName} ${customer.lastName}`.trim();
    setQuery(name);
    onChange({ id: customer.customerId || customer.id!, name });
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
          placeholder="Search customer..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        />
        {(value || query) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {isSearching ? (
            <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No customers found</div>
          ) : (
            results.map((customer) => {
              const name = customer.fullName || `${customer.firstName} ${customer.lastName}`.trim();
              return (
                <button
                  key={customer.customerId || customer.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 focus:bg-primary-50 transition-colors"
                  onClick={() => handleSelect(customer)}
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-gray-400 ml-2">ID: {customer.idNumber}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export const LoansPage = () => {
  const [filters, setFilters] = useState<LoanFiltersType>({
    page: 0,
    size: 10,
  });

  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading, error } = useLoans(filters);
  const { data: loanOfficers } = useLoanOfficers();

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    loanRef: true,
    customer: true,
    amount: true,
    status: true,
    outstandingBalance: true,
    repaymentPercentage: true,
    arrears: true,
    disbursementDate: false,
    loanOfficer: false,
  });

  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnOptions(false);
      }
    };

    if (showColumnOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnOptions]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.values(LoanStatus).map((status) => ({
      value: status,
      label: status,
    })),
  ];

  const loanOfficerOptions = [
    { value: '', label: 'All Officers' },
    ...(loanOfficers?.map((officer) => ({
      value: (officer.loanOfficerId || officer.id)?.toString() || '',
      label: officer.fullName || `${officer.firstName || ''} ${officer.lastName || ''}`.trim(),
    })).filter(opt => opt.value !== '') || []),
  ];

  const handleFilterChange = (key: keyof LoanFiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0,
    }));
  };

  const handleCustomerSelect = (customer: { id: number; name: string } | null) => {
    setSelectedCustomer(customer);
    setFilters((prev) => ({
      ...prev,
      customerId: customer?.id || undefined,
      page: 0,
    }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 0, size: 10 });
    setSelectedCustomer(null);
  };

  const handlePageSizeChange = (newSize: number) => {
    setFilters((prev) => ({
      ...prev,
      size: newSize,
      page: 0,
    }));
  };

  const getLoanStatusBadge = (status: LoanStatus) => {
    const badges = {
      [LoanStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [LoanStatus.APPROVED]: 'bg-blue-100 text-blue-800',
      [LoanStatus.DISBURSED]: 'bg-purple-100 text-purple-800',
      [LoanStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [LoanStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
      [LoanStatus.REJECTED]: 'bg-red-100 text-red-800',
      [LoanStatus.DEFAULTED]: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load loans. Please try again.</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    );
  }

  const loans = data?.data || [];
  const hasActiveFilters = filters.loanReference || filters.loanStatus || filters.loanOfficerId || filters.customerId || filters.fromDate || filters.toDate;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600 mt-1">Manage and track all loan applications</p>
        </div>
        <div className="flex gap-2">
          <div className="relative" ref={dropdownRef}>
            <Button variant="outline" onClick={() => setShowColumnOptions(!showColumnOptions)}>
              View Options
            </Button>
            {showColumnOptions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200 p-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase">Columns</div>
                <div className="space-y-1">
                  <label className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                    <input type="checkbox" checked={visibleColumns.outstandingBalance} onChange={() => toggleColumn('outstandingBalance')} className="mr-2" />
                    <span className="text-sm">Outstanding Balance</span>
                  </label>
                  <label className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                    <input type="checkbox" checked={visibleColumns.repaymentPercentage} onChange={() => toggleColumn('repaymentPercentage')} className="mr-2" />
                    <span className="text-sm">Repayment %</span>
                  </label>
                  <label className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                    <input type="checkbox" checked={visibleColumns.arrears} onChange={() => toggleColumn('arrears')} className="mr-2" />
                    <span className="text-sm">Arrears</span>
                  </label>
                  <label className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                    <input type="checkbox" checked={visibleColumns.disbursementDate} onChange={() => toggleColumn('disbursementDate')} className="mr-2" />
                    <span className="text-sm">Disbursement Date</span>
                  </label>
                  <label className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                    <input type="checkbox" checked={visibleColumns.loanOfficer} onChange={() => toggleColumn('loanOfficer')} className="mr-2" />
                    <span className="text-sm">Loan Officer</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          <Link to={ROUTES.LOANS_CREATE}>
            <Button>+ New Loan</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Input
            label="Loan Reference"
            placeholder="Search by reference..."
            value={filters.loanReference || ''}
            onChange={(e) => handleFilterChange('loanReference', e.target.value || undefined)}
          />

          <CustomerSearch
            value={selectedCustomer}
            onChange={handleCustomerSelect}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={filters.loanStatus || ''}
            onChange={(e) => handleFilterChange('loanStatus', e.target.value || undefined)}
          />

          <Select
            label="Loan Officer"
            options={loanOfficerOptions}
            value={filters.loanOfficerId?.toString() || ''}
            onChange={(e) => handleFilterChange('loanOfficerId', e.target.value ? Number(e.target.value) : undefined)}
          />

          <Input
            label="From Date"
            type="date"
            value={filters.fromDate || ''}
            onChange={(e) => handleFilterChange('fromDate', e.target.value || undefined)}
          />

          <Input
            label="To Date"
            type="date"
            value={filters.toDate || ''}
            onChange={(e) => handleFilterChange('toDate', e.target.value || undefined)}
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {loans.length === 0 ? (
        <EmptyState
          title="No loans found"
          description={hasActiveFilters ? "No loans match your filter criteria" : "Get started by creating your first loan"}
          action={
            <Link to={ROUTES.LOANS_CREATE}>
              <Button>+ Create Loan</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Loan Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  {visibleColumns.outstandingBalance && <TableHead>Balance</TableHead>}
                  {visibleColumns.repaymentPercentage && <TableHead>Repayment</TableHead>}
                  {visibleColumns.arrears && <TableHead>Arrears</TableHead>}
                  {visibleColumns.disbursementDate && <TableHead>Disbursement Date</TableHead>}
                  {visibleColumns.loanOfficer && <TableHead>Loan Officer</TableHead>}
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {loans.map((loan, index) => {
                  const outstandingBalance = loan.outstandingBalance ?? (loan.totalLoanAmount - (loan.totalRepaid || 0));
                  const repaymentPercentage = loan.repaymentPercentage ??
                    (loan.totalLoanAmount ? Math.round(((loan.totalRepaid || (loan.totalLoanAmount - outstandingBalance)) / loan.totalLoanAmount) * 100) : 0);
                  const arrearsAmount = loan.arrearsAmount ?? 0;

                  return (
                    <TableRow key={loan.loanId || loan.id || `loan-${index}`}>
                      <TableCell>
                        <span className="font-medium">
                          {loan.loanReference || `#${loan.loanId || loan.id}`}
                        </span>
                      </TableCell>
                      <TableCell>{loan.customerName}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(loan.totalLoanAmount || loan.loanAmount || 0)}
                        </span>
                      </TableCell>
                      <TableCell>{getLoanStatusBadge(loan.loanStatus || loan.status)}</TableCell>

                      {visibleColumns.outstandingBalance && (
                        <TableCell>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(outstandingBalance)}
                          </span>
                        </TableCell>
                      )}

                      {visibleColumns.repaymentPercentage && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${repaymentPercentage >= 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                                style={{ width: `${Math.min(repaymentPercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{Number(repaymentPercentage).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                      )}

                      {visibleColumns.arrears && (
                        <TableCell>
                          <span className={`${arrearsAmount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {arrearsAmount > 0 ? formatCurrency(arrearsAmount) : '-'}
                          </span>
                        </TableCell>
                      )}

                      {visibleColumns.disbursementDate && (
                        <TableCell>
                          {loan.disbursementDate ? formatDate(loan.disbursementDate) : '-'}
                        </TableCell>
                      )}

                      {visibleColumns.loanOfficer && (
                        <TableCell>{loan.loanOfficerName}</TableCell>
                      )}

                      <TableCell>
                        <Link
                          to={`${ROUTES.LOANS}/${loan.loanId || loan.id}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between bg-white px-6 py-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing page {(data?.page ?? 0) + 1} of {data?.totalPages || 1} ({data?.total || loans.length} total loans)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Per page:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filters.size || 10}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(0, (prev.page ?? 0) - 1) }))}
                disabled={(filters.page ?? 0) === 0}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }))}
                disabled={(filters.page ?? 0) >= (data?.totalPages ?? 1) - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
