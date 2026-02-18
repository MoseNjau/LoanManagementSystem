import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useLoan, useLoanSchedules, useLoanRepayments, useLoans } from '@/hooks/use-loans';
import { loanService } from '@/services/loan.service';
import LoanStatementPDF from '@/components/LoanStatementPDF';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/Loading';
import { LoanStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

export const LoanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const loanId = Number(id);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'schedules' | 'repayments'>('overview');

  const { data: loanData, isLoading: loanLoading } = useLoan(loanId);
  
  // Also fetch loans list to get computed fields if they are missing
  const { data: loansList } = useLoans({ 
    loanReference: loanData?.loanReference 
  });
  
  // Merge loan data with computed fields from list if available
  const loan = loansList?.data?.find(l => l.loanReference === loanData?.loanReference) || loanData;

  const { data: schedules, isLoading: schedulesLoading } = useLoanSchedules(loanId);
  const { data: repayments, isLoading: repaymentsLoading } = useLoanRepayments(loanId);
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to handle statement download
  const handleDownloadStatement = async () => {
    try {
      if (!loan) return;
      setIsDownloading(true);

      // Fetch fresh summary and repayments for statement
      const summaryData = await loanService.getLoanSummary(loan.loanReference || '');
      const repaymentsData = await loanService.getStatementRepayments(loanId);
      
      // Use summaryData if available (from list endpoint), otherwise fallback to loan object
      // Using 'any' cast for repaymentsData if types mismatch, but they should align mostly
      const blob = await pdf(
        <LoanStatementPDF 
          summary={summaryData || loan} 
          repayments={repaymentsData} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LoanStatement-${loan.loanReference || loanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating statement:', error);
      alert('Failed to generate statement. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[status]}`}>
        {status}
      </span>
    );
  };

  const getScheduleStatusBadge = (schedule: any) => {
    // Derive status from backend fields
    let status: string;
    const paidAmount = schedule.paidAmount || 0;
    const expectedAmount = schedule.expectedAmount || 0;
    
    if (paidAmount >= expectedAmount) {
      status = 'PAID';
    } else if (schedule.offTrack) {
      status = 'OVERDUE';
    } else if (paidAmount > 0) {
      status = 'PARTIALLY_PAID';
    } else {
      status = 'PENDING';
    }
    
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      PARTIALLY_PAID: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };
  
  if (loanLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  );

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Loan not found</p>
        <Link to={ROUTES.LOANS}>
          <Button className="mt-4">Back to Loans</Button>
        </Link>
      </div>
    );
  }

  // Calculate fields if not present
  const outstandingBalance = loan.outstandingBalance ?? (loan.totalLoanAmount - (loan.totalRepaid || 0));
  const repaymentPercentage = loan.repaymentPercentage ?? 
    (loan.totalLoanAmount ? Math.round(((loan.totalRepaid || (loan.totalLoanAmount - outstandingBalance)) / loan.totalLoanAmount) * 100) : 0);
  const totalRepaid = loan.totalRepaid ?? (loan.totalLoanAmount - outstandingBalance);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Loan {loan.loanReference || `#${loan.loanId || loan.id}`}
          </h1>
          <p className="text-gray-600 mt-1">{loan.customerName}</p>
        </div>
        <div className="flex gap-2 items-center">
          {getLoanStatusBadge(loan.loanStatus || loan.status)}
          
          <Button 
            variant="outline" 
            onClick={handleDownloadStatement}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download Statement'}
          </Button>
          
          <Link to={ROUTES.LOANS}>
            <Button variant="secondary">Back to Loans</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'schedules'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('schedules')}
          >
            Payment Schedules
          </button>
          <button
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'repayments'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('repayments')}
          >
            Repayments
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Principal Amount:</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(loan.principalAmount || loan.totalLoanAmount || loan.loanAmount || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Interest Rate:</dt>
                <dd className="text-sm font-semibold text-gray-900">{loan.interestRate}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Interest Amount:</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(loan.interestAmount || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Total Amount:</dt>
                <dd className="text-sm font-semibold text-primary-600">{formatCurrency(loan.totalLoanAmount || loan.totalAmount || loan.loanAmount || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Tenure:</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {loan.tenureValue} {loan.tenureUnit}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Installment Amount:</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(loan.installmentAmount || 0)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Disbursement Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Disbursement Date:</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {loan.disbursementDate ? formatDate(loan.disbursementDate) : 'Not disbursed'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Disbursement Method:</dt>
                <dd className="text-sm font-semibold text-gray-900">{loan.disbursementMethod || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Disbursement Cost:</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(loan.disbursementCost || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Loan Officer:</dt>
                <dd className="text-sm font-semibold text-gray-900">{loan.loanOfficerName}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Repayment Progress</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Total Repaid:</dt>
                <dd className="text-sm font-semibold text-green-600">{formatCurrency(totalRepaid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Outstanding Balance:</dt>
                <dd className="text-sm font-semibold text-error-600">{formatCurrency(outstandingBalance)}</dd>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Repayment Progress</span>
                  <span>{repaymentPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(repaymentPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Application Date:</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {(loan.applicationDate || loan.dateCreated || loan.createdAt) 
                    ? formatDate(loan.applicationDate || loan.dateCreated || loan.createdAt!) 
                    : '-'}
                </dd>
              </div>
              {loan.approvalDate && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Approval Date:</dt>
                  <dd className="text-sm font-semibold text-gray-900">{formatDate(loan.approvalDate)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Created At:</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {(loan.dateCreated || loan.createdAt) 
                    ? formatDate(loan.dateCreated || loan.createdAt!) 
                    : '-'}
                </dd>
              </div>
              {(loan.updatedAt) && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Last Updated:</dt>
                  <dd className="text-sm font-semibold text-gray-900">{formatDate(loan.updatedAt)}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <Card className="p-6">
          {schedulesLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : schedules && schedules.length > 0 ? (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>#</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Expected Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule, index) => (
                  <TableRow key={schedule.scheduleId || schedule.id || `schedule-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{formatDate(schedule.dueDate)}</TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatCurrency(schedule.expectedAmount || schedule.totalDue || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(schedule.paidAmount || schedule.totalPaid || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-error-600 font-medium">
                        {formatCurrency(schedule.remainingAmount || schedule.outstandingBalance || 0)}
                      </span>
                    </TableCell>
                    <TableCell>{getScheduleStatusBadge(schedule)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No payment schedules available</p>
          )}
        </Card>
      )}

      {/* Repayments Tab */}
      {activeTab === 'repayments' && (
        <Card className="p-6">
          {repaymentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : repayments && repayments.length > 0 ? (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {repayments.map((repayment, index) => (
                  <TableRow key={repayment.id || repayment.repaymentId || `repayment-${index}`}>
                    <TableCell>{formatDate(repayment.paymentDate)}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(repayment.amount || repayment.amountPaid || 0)}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(repayment.principalAmount || repayment.principalPaid || 0)}</TableCell>
                    <TableCell>{formatCurrency(repayment.interestAmount || repayment.interestPaid || 0)}</TableCell>
                    <TableCell>
                      {formatCurrency(repayment.penaltyAmount || repayment.penaltyPaid || 0)}
                    </TableCell>
                    <TableCell>{repayment.paymentMethod || repayment.paymentChannel || '-'}</TableCell>
                    <TableCell>{repayment.transactionReference || repayment.mpesaReference || '-'}</TableCell>
                    <TableCell>
                      <span className="max-w-xs truncate block">
                        {repayment.notes || '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No repayments recorded yet</p>
          )}
        </Card>
      )}
    </div>
  );
};
