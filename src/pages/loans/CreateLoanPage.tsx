import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateLoan, useLoanCalculator } from '@/hooks/use-loans';
import { useCustomers } from '@/hooks/use-customers';
import { useLoanOfficers } from '@/hooks/use-loan-officers';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { CreateLoanDTO, TenureUnit, DisbursementMethod } from '@/types';
import { UserRole } from '@/types/enums';
import { formatCurrency } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

export const CreateLoanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLoanDTO>();

  const createLoan = useCreateLoan();
  const loanCalculator = useLoanCalculator();
  const { data: customers, isLoading: customersLoading } = useCustomers({ page: 0, limit: 1000 });
  const { data: loanOfficers, isLoading: officersLoading } = useLoanOfficers();

  const [calculationResult, setCalculationResult] = useState<any>(null);

  const principalAmount = watch('principalAmount');
  const tenureValue = watch('tenureValue');
  const tenureUnit = watch('tenureUnit');

  // Auto-select loan officer if logged in as loan officer
  useEffect(() => {
    if (user && user.role === UserRole.LOAN_OFFICER && loanOfficers) {
      // Try to find matching loan officer by user ID
      const matchingOfficer = loanOfficers.find(officer => (officer.loanOfficerId || officer.id) === user.id);
      if (matchingOfficer) {
        setValue('loanOfficerId', matchingOfficer.loanOfficerId || matchingOfficer.id || 0);
      }
    }
  }, [user, loanOfficers, setValue]);

  useEffect(() => {
    if (principalAmount && tenureValue && tenureUnit) {
      const timer = setTimeout(() => {
        loanCalculator.mutate(
          { principalAmount: Number(principalAmount), tenureValue: Number(tenureValue), tenureUnit },
          {
            onSuccess: (data) => {
              setCalculationResult(data);
            },
          }
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [principalAmount, tenureValue, tenureUnit]);

  const onSubmit = async (data: CreateLoanDTO) => {
    createLoan.mutate(
      {
        ...data,
        principalAmount: Number(data.principalAmount),
        tenureValue: Number(data.tenureValue),
        disbursementCost: Number(data.disbursementCost),
        customerId: Number(data.customerId),
        loanOfficerId: Number(data.loanOfficerId),
      },
      {
        onSuccess: () => {
          navigate(ROUTES.LOANS);
        },
      }
    );
  };

  const tenureUnitOptions = [
    { value: TenureUnit.DAYS, label: 'Days' },
    { value: TenureUnit.WEEKS, label: 'Weeks' },
    { value: TenureUnit.MONTHS, label: 'Months' },
  ];

  const disbursementMethodOptions = [
    { value: DisbursementMethod.MPESA, label: 'M-Pesa' },
    { value: DisbursementMethod.BANK_TRANSFER, label: 'Bank Transfer' },
    { value: DisbursementMethod.CASH, label: 'Cash' },
  ];

  const customerOptions = customers?.data.map((customer) => ({
    value: customer.customerId || customer.id || 0,
    label: `${customer.fullName} - ${customer.phoneNumber}`,
  })) || [];

  const loanOfficerOptions = loanOfficers?.map((officer) => ({
    value: officer.loanOfficerId || officer.id || 0,
    label: officer.fullName || `${officer.firstName} ${officer.lastName}`,
  })).filter(opt => opt.value !== 0) || [];

  if (customersLoading || officersLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Loan</h1>
        <p className="text-gray-600 mt-1">Fill in the loan details to create a new loan application</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Customer"
              options={customerOptions}
              error={errors.customerId?.message}
              {...register('customerId', { required: 'Customer is required' })}
            />

            <Select
              label="Loan Officer"
              options={loanOfficerOptions}
              error={errors.loanOfficerId?.message}
              {...register('loanOfficerId', { required: 'Loan officer is required' })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Principal Amount (KES)"
              type="number"
              placeholder="100000"
              error={errors.principalAmount?.message}
              {...register('principalAmount', {
                required: 'Principal amount is required',
                min: { value: 1000, message: 'Minimum loan amount is KES 1,000' },
              })}
            />

            <Input
              label="Tenure Value"
              type="number"
              placeholder="4"
              error={errors.tenureValue?.message}
              {...register('tenureValue', {
                required: 'Tenure value is required',
                min: { value: 1, message: 'Minimum tenure is 1' },
              })}
            />

            <Select
              label="Tenure Unit"
              options={tenureUnitOptions}
              error={errors.tenureUnit?.message}
              {...register('tenureUnit', { required: 'Tenure unit is required' })}
            />
          </div>

          {calculationResult && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Loan Calculation Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Principal</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(calculationResult.principalAmount)}</p>
                </div>
                <div>
                  <p className="text-blue-600">Interest ({calculationResult.interestRate}%)</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(calculationResult.interestAmount)}</p>
                </div>
                <div>
                  <p className="text-blue-600">Total Amount</p>
                  <p className="font-semibold text-blue-900">
                    {formatCurrency(calculationResult.totalAmount || (calculationResult.principalAmount + calculationResult.interestAmount))}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600">Installment</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(calculationResult.installmentAmount)}</p>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {calculationResult.numberOfInstallments} installments of {formatCurrency(calculationResult.installmentAmount)} each
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Disbursement Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Disbursement Date"
              type="date"
              error={errors.disbursementDate?.message}
              {...register('disbursementDate', { required: 'Disbursement date is required' })}
            />

            <Input
              label="Disbursement Cost (KES)"
              type="number"
              placeholder="108"
              error={errors.disbursementCost?.message}
              {...register('disbursementCost', {
                required: 'Disbursement cost is required',
                min: { value: 0, message: 'Disbursement cost cannot be negative' },
              })}
            />

            <Select
              label="Disbursement Method"
              options={disbursementMethodOptions}
              error={errors.disbursementMethod?.message}
              {...register('disbursementMethod', { required: 'Disbursement method is required' })}
            />
          </div>
        </Card>

        {createLoan.isError && (
          <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-600">
              {createLoan.error instanceof Error ? createLoan.error.message : 'Failed to create loan. Please try again.'}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            isLoading={createLoan.isPending}
            disabled={createLoan.isPending}
          >
            Create Loan
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(ROUTES.LOANS)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
