import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateLoanOfficer } from '@/hooks/use-loan-officers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CreateLoanOfficerDTO } from '@/types';
import { ROUTES } from '@/utils/constants';

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const createOfficer = useCreateLoanOfficer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLoanOfficerDTO>();

  const onSubmit = async (data: CreateLoanOfficerDTO) => {
    createOfficer.mutate(data, {
      onSuccess: () => {
        navigate(ROUTES.USERS);
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Loan Officer</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new loan officer account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName', { required: 'First name is required' })}
            />

            <Input
              label="Middle Name (Optional)"
              placeholder="Michael"
              {...register('middleName')}
            />

            <Input
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName', { required: 'Last name is required' })}
            />

            <Input
              label="Other Names (Optional)"
              placeholder="Additional names"
              {...register('otherNames')}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              placeholder="jdoe"
              error={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                pattern: {
                  value: /^[a-zA-Z0-9_]{3,20}$/,
                  message: 'Username must be 3-20 characters (letters, numbers, underscore only)',
                },
              })}
            />

            <Input
              label="Phone Number"
              placeholder="0712345678"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^(254|0)[17]\d{8}$/,
                  message: 'Invalid phone number format',
                },
              })}
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium">Default Password</p>
            <p className="text-xs text-blue-700 mt-1">
              The loan officer's initial password will be set to their phone number. 
              They should change it upon first login.
            </p>
          </div>
        </Card>

        {createOfficer.isError && (
          <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-600">
              {createOfficer.error instanceof Error
                ? createOfficer.error.message
                : 'Failed to create loan officer. Please try again.'}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            isLoading={createOfficer.isPending}
            disabled={createOfficer.isPending}
          >
            Create Loan Officer
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(ROUTES.USERS)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
