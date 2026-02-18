import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/Loading';
import { CreateCustomerDTO } from '@/types';
import { Gender, MaritalStatus } from '@/types/enums';
import { ROUTES } from '@/utils/constants';
import { validatePhoneNumber, validateIdNumber } from '@/utils/helpers';

export const EditCustomerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = Number(id);
  
  const { data: customer, isLoading: isLoadingCustomer } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer(customerId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCustomerDTO>();

  // Watch fields for full name auto-generation display
  const firstName = watch('firstName', '');
  const middleName = watch('middleName', '');
  const lastName = watch('lastName', '');

  // Pre-fill form when customer data loads
  useEffect(() => {
    if (customer) {
      setValue('firstName', customer.firstName);
      setValue('middleName', customer.middleName || '');
      setValue('lastName', customer.lastName);
      setValue('otherNames', customer.otherNames || '');
      setValue('idNumber', customer.idNumber);
      
      // Format date for input type="date" (YYYY-MM-DD)
      const dateOfBirth = customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '';
      setValue('dateOfBirth', dateOfBirth);
      
      setValue('gender', customer.gender as Gender);
      setValue('maritalStatus', customer.maritalStatus as MaritalStatus);
      setValue('phoneNumber', customer.phoneNumber);
      setValue('alternativePhoneNumber', customer.alternativePhoneNumber || '');
      setValue('emailAddress', customer.emailAddress || '');
      setValue('residentialAddress', customer.residentialAddress);
      setValue('townOrArea', customer.townOrArea);
      setValue('mobileMoneyNumber', customer.mobileMoneyNumber || '');
    }
  }, [customer, setValue]);

  const onSubmit = async (data: CreateCustomerDTO) => {
    const fullName = [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(' ');

    const payload = {
      ...data,
      fullName,
      otherNames: data.otherNames || null,
      middleName: data.middleName || null,
      alternativePhoneNumber: data.alternativePhoneNumber || undefined,
      emailAddress: data.emailAddress,
      mobileMoneyNumber: data.mobileMoneyNumber,
    };

    try {
      await updateCustomer.mutateAsync(payload);
      navigate(ROUTES.CUSTOMER_DETAIL(customerId));
    } catch (error) {
      console.error('Failed to update customer:', error);
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

  if (isLoadingCustomer) {
    return <LoadingPage />;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
        <Button className="mt-4" onClick={() => navigate(ROUTES.CUSTOMERS)}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
          <p className="mt-2 text-gray-600">
            Update customer information for {customer.fullName}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.CUSTOMER_DETAIL(customerId))}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            isLoading={updateCustomer.isPending}
            disabled={updateCustomer.isPending}
          >
            Save Changes
          </Button>
        </div>
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
                placeholder="email@example.com"
                error={errors.emailAddress?.message}
                {...register('emailAddress')}
              />

              <Input
                label="Mobile Money Number"
                placeholder="254712345678"
                helperText="Format: 254712345678"
                error={errors.mobileMoneyNumber?.message}
                {...register('mobileMoneyNumber', {
                   validate: (value) =>
                    !value || validatePhoneNumber(value) || 'Invalid phone number format',
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
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
