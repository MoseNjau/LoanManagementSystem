import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer, useUpdateCustomerField } from '@/hooks/use-customers';
import { useLoanOfficer } from '@/hooks/use-loan-officers';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/Loading';
import { formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { Gender, MaritalStatus } from '@/types/enums';
import { CreateCustomerDTO } from '@/types';

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = Number(id);
  const { user } = useAuthStore();
  const { data: customer, isLoading } = useCustomer(customerId);
  const { mutate: updateField, isPending: isUpdating } = useUpdateCustomerField(customerId);
  const { data: loanOfficer } = useLoanOfficer(customer?.loanOfficerId || 0);
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);

  if (isLoading) {
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

  const FIELD_MAPPING: Record<string, string> = {
    firstName: 'first_name',
    middleName: 'middle_name',
    lastName: 'last_name',
    otherNames: 'other_names',
    fullName: 'full_name',
    dateOfBirth: 'date_of_birth',
    gender: 'gender',
    maritalStatus: 'marital_status',
    phoneNumber: 'phone_number',
    alternativePhoneNumber: 'alternative_phone_number',
    emailAddress: 'email_address',
    residentialAddress: 'residential_address',
    mobileMoneyNumber: 'mobile_money_number',
    townOrArea: 'town_or_area',
    status: 'status',
    loanOfficerId: 'loan_officer_id'
  };

  const handleUpdate = (field: keyof CreateCustomerDTO, value: any) => {
    if (!customer || !user?.id) {
        console.error('Cannot update: Missing customer or user context');
        return;
    }

    const columnName = FIELD_MAPPING[field as string];
    if (!columnName) {
      console.error(`No backend column mapping for field: ${String(field)}`);
      return;
    }

    // Call update endpoint
    updateField({
      columnName,
      newValue: value,
      updatedBy: user.id
    });

    // Special handling for Name fields (also update full_name)
    if (['firstName', 'middleName', 'lastName'].includes(field as string)) {
        let firstName = customer.firstName;
        let middleName = customer.middleName;
        let lastName = customer.lastName;
    
        if (field === 'firstName') firstName = value;
        if (field === 'middleName') middleName = value;
        if (field === 'lastName') lastName = value;
    
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
        
        // Also update full_name
        updateField({
            columnName: 'full_name',
            newValue: fullName,
            updatedBy: user.id
        });
    }
  };

  const EditableInfoRow = ({ 
    label, 
    value, 
    field, 
    type = 'text', 
    options 
  }: { 
    label: string; 
    value: string | number | undefined | null; 
    field: keyof CreateCustomerDTO; 
    type?: 'text' | 'date' | 'select' | 'tel' | 'email'; 
    options?: { value: string; label: string }[]; 
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || '');

    const onSave = () => {
      handleUpdate(field, editValue);
      setIsEditing(false);
    };

    const onCancel = () => {
      setEditValue(value || '');
      setIsEditing(false);
    };

    // Reset editing state when global edit mode is disabled
    useEffect(() => {
      if (!isGlobalEditMode) {
        setIsEditing(false);
      }
    }, [isGlobalEditMode]);

    return (
      <div className="py-3 border-b border-gray-200 last:border-0 flex justify-between items-center group">
        <div className="flex-1">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          {isEditing ? (
            <div className="mt-1 flex items-center gap-2">
              {type === 'select' ? (
                <Select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  options={options || []}
                  className="!mt-0 w-full"
                />
              ) : (
                <Input
                  type={type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="!mt-0 w-full"
                  autoFocus
                />
              )}
              <div className="flex gap-1">
                <button
                  onClick={onSave}
                  disabled={isUpdating}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Save"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={onCancel}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Cancel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
              <span>
                {options 
                  ? options.find(opt => opt.value === value)?.label || value || '-'
                  : value || '-'}
              </span>
              {isGlobalEditMode && (
                <button
                  onClick={() => {
                    setEditValue(value || '');
                    setIsEditing(true);
                  }}
                  className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </dd>
          )}
        </div>
      </div>
    );
  };

  const ReadOnlyInfoRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <div className="py-3 border-b border-gray-200 last:border-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );

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

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'BLOCKED', label: 'Inactive' },
    { value: 'BLACKLISTED', label: 'Blacklisted' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
              {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.fullName}</h1>
              <p className="mt-1 text-gray-600">Customer ID: #{customer.customerId || customer.id}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant={isGlobalEditMode ? "primary" : "outline"} 
            onClick={() => setIsGlobalEditMode(!isGlobalEditMode)}
          >
            {isGlobalEditMode ? 'Done Editing' : 'Edit Customer'}
          </Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.CUSTOMERS)}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-200">
              <EditableInfoRow label="First Name" value={customer.firstName} field="firstName" />
              <EditableInfoRow label="Middle Name" value={customer.middleName} field="middleName" />
              <EditableInfoRow label="Last Name" value={customer.lastName} field="lastName" />
              <EditableInfoRow label="Other Names" value={customer.otherNames} field="otherNames" />
              <ReadOnlyInfoRow label="ID Number" value={customer.idNumber} /> {/* ID Number usually shouldn't be editable easily */}
              <EditableInfoRow label="Date of Birth" value={customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : ''} field="dateOfBirth" type="date" />
              <EditableInfoRow label="Gender" value={customer.gender} field="gender" type="select" options={genderOptions} />
              <EditableInfoRow label="Marital Status" value={customer.maritalStatus} field="maritalStatus" type="select" options={maritalStatusOptions} />
              <EditableInfoRow label="Status" value={customer.status} field="status" type="select" options={statusOptions} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-200">
              <ReadOnlyInfoRow label="Phone Number" value={customer.phoneNumber} />
              <EditableInfoRow 
                label="Alternative Phone" 
                value={customer.alternativePhoneNumber} 
                field="alternativePhoneNumber"
                type="tel"
              />
              {customer.emailAddress ? (
                <ReadOnlyInfoRow label="Email Address" value={customer.emailAddress} />
              ) : (
                <EditableInfoRow label="Email Address" value={customer.emailAddress} field="emailAddress" type="email" />
              )}
              <ReadOnlyInfoRow label="Mobile Money" value={customer.mobileMoneyNumber} />
              <EditableInfoRow label="Residential Address" value={customer.residentialAddress} field="residentialAddress" />
              <EditableInfoRow label="Town/Area" value={customer.townOrArea} field="townOrArea" />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Loan Officer</h2>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-200">
              <ReadOnlyInfoRow 
                label="Loan Officer" 
                value={loanOfficer ? loanOfficer.fullName : `ID: ${customer.loanOfficerId}`} 
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-200">
              <ReadOnlyInfoRow 
                label="Created At" 
                value={(customer.dateCreated || customer.createdAt) ? formatDate(customer.dateCreated || customer.createdAt!, 'long') : '-'} 
              />
              <ReadOnlyInfoRow 
                label="Updated At" 
                value={(customer.dateUpdated || customer.updatedAt) ? formatDate(customer.dateUpdated || customer.updatedAt!, 'long') : '-'} 
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Loan History</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No loan history available
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
