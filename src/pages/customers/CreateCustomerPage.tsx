import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateCustomer } from '@/hooks/use-customers';
import { useLoanOfficers } from '@/hooks/use-loan-officers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CreateCustomerDTO } from '@/types';
import { Gender, MaritalStatus } from '@/types/enums';
import { ROUTES } from '@/utils/constants';
import { validateEmail, validatePhoneNumber, validateIdNumber } from '@/utils/helpers';

export const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();
  const { data: loanOfficers } = useLoanOfficers();

  const loanOfficerOptions = loanOfficers?.map(officer => ({
    value: officer.loanOfficerId || officer.id || 0,
    label: officer.fullName
  })) || [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCustomerDTO>();

  const firstName = watch('firstName', '');
  const middleName = watch('middleName', '');
  const lastName = watch('lastName', '');

  const onSubmit = async (data: CreateCustomerDTO) => {
    const fullName = [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(' ');

    const payload = {
      ...data,
      fullName,
      otherNames: data.otherNames || null,
      middleName: data.middleName || null,
    };

    try {
      await createCustomer.mutateAsync(payload);
      navigate(ROUTES.CUSTOMERS);
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const genderOptions = [
    { value: Gender.MALE, label: 'Male' },
    { value: Gender.FEMALE, label: 'Female' },
    { value: Gender.OTHER, label: 'Other' },
  ];

  const maritalStatusOptions = [
    { value: MaritalStatus.SINGLE, label: 'Single' },
    { value: MaritalStatus.MARRIED, label: 'Married' },
    { value: MaritalStatus.DIVORCED, label: 'Divorced' },
    { value: MaritalStatus.WIDOWED, label: 'Widowed' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
          <p className="mt-2 text-gray-600">
            Fill in the customer information below
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.CUSTOMERS)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                required
                placeholder="Enter first name"
                error={errors.firstName?.message}
                {...register('firstName', {
                  required: 'First name is required',
                })}
              />

              <Input
                label="Middle Name"
                placeholder="Enter middle name"
                error={errors.middleName?.message}
                {...register('middleName')}
              />

              <Input
                label="Last Name"
                required
                placeholder="Enter last name"
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Last name is required',
                })}
              />

              <Input
                label="Other Names"
                placeholder="Enter other names"
                error={errors.otherNames?.message}
                {...register('otherNames')}
              />

              <div className="md:col-span-2">
                <Input
                  label="Full Name"
                  value={[firstName, middleName, lastName].filter(Boolean).join(' ')}
                  disabled
                  helperText="Auto-generated from names above"
                />
              </div>

              <Input
                label="ID Number"
                required
                placeholder="Enter ID number"
                error={errors.idNumber?.message}
                {...register('idNumber', {
                  required: 'ID number is required',
                  validate: (value) =>
                    validateIdNumber(value) || 'Invalid ID number format',
                })}
              />

              <Input
                label="Date of Birth"
                type="date"
                required
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth', {
                  required: 'Date of birth is required',
                })}
              />

              <Select
                label="Gender"
                required
                options={genderOptions}
                error={errors.gender?.message}
                {...register('gender', {
                  required: 'Gender is required',
                })}
              />

              <Select
                label="Marital Status"
                required
                options={maritalStatusOptions}
                error={errors.maritalStatus?.message}
                {...register('maritalStatus', {
                  required: 'Marital status is required',
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone Number"
                required
                placeholder="254712345678"
                helperText="Format: 254712345678"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  validate: (value) =>
                    validatePhoneNumber(value) || 'Invalid phone number format',
                })}
              />

              <Input
                label="Alternative Phone Number"
                placeholder="254712345678"
                helperText="Format: 254712345678"
                error={errors.alternativePhoneNumber?.message}
                {...register('alternativePhoneNumber', {
                  validate: (value) =>
                    !value || validatePhoneNumber(value) || 'Invalid phone number format',
                })}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="customer@example.com"
                error={errors.emailAddress?.message}
                {...register('emailAddress', {
                  required: 'Email is required',
                  validate: (value) =>
                    validateEmail(value) || 'Invalid email format',
                })}
              />

              <Input
                label="Mobile Money Number"
                required
                placeholder="254712345678"
                helperText="Format: 254712345678"
                error={errors.mobileMoneyNumber?.message}
                {...register('mobileMoneyNumber', {
                  required: 'Mobile money number is required',
                  validate: (value) =>
                    validatePhoneNumber(value) || 'Invalid mobile money number format',
                })}
              />

              <Input
                label="Residential Address"
                required
                placeholder="Enter residential address"
                error={errors.residentialAddress?.message}
                {...register('residentialAddress', {
                  required: 'Residential address is required',
                })}
              />

              <Input
                label="Town/Area"
                required
                placeholder="Enter town or area"
                error={errors.townOrArea?.message}
                {...register('townOrArea', {
                  required: 'Town/Area is required',
                })}
              />

              <Select
                label="Loan Officer"
                required
                placeholder="Select Loan Officer"
                options={loanOfficerOptions}
                error={errors.loanOfficerId?.message}
                {...register('loanOfficerId', {
                  required: 'Loan officer is required',
                  valueAsNumber: true,
                })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.CUSTOMERS)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createCustomer.isPending}
          >
            Create Customer
          </Button>
        </div>
      </form>
    </div>
  );
};
