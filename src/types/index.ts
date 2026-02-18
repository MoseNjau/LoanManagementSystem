import { UserRole, Permission, Gender, MaritalStatus, LoanStatus, TenureUnit, DisbursementMethod } from './enums';

export { UserRole, Permission, Gender, MaritalStatus, LoanStatus, TenureUnit, DisbursementMethod };

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Customer {
  customerId: number; // Backend uses customerId, not id
  id?: number; // Backward compatibility
  firstName: string;
  middleName?: string;
  lastName: string;
  otherNames?: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  phoneNumber: string;
  alternativePhoneNumber?: string;
  emailAddress: string;
  residentialAddress: string;
  mobileMoneyNumber: string;
  townOrArea: string;
  status?: string; // Backend returns status field
  loanOfficerId: number;
  dateCreated?: string; // Backend uses dateCreated
  dateUpdated?: string; // Backend uses dateUpdated
  createdAt?: string; // Backward compatibility
  updatedAt?: string; // Backward compatibility
  createdBy?: string | null; // Backend field
  updatedBy?: string | null; // Backend field
  passwordChanged?: boolean; // Backend field
}

export interface CreateCustomerDTO {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  otherNames?: string | null;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  phoneNumber: string;
  alternativePhoneNumber?: string;
  emailAddress: string;
  residentialAddress: string;
  mobileMoneyNumber: string;
  townOrArea: string;
  loanOfficerId: number;
  status?: string;
}

export interface Loan {
  loanId: number; // Backend uses loanId, not id
  id?: number; // Keep for backward compatibility
  customerId: number;
  customerName: string;
  loanAmount?: number; // For backward compatibility
  totalLoanAmount: number; // Actual backend field
  principalAmount: number;
  interestAmount: number;
  interestRate?: number;
  duration?: number;
  status?: LoanStatus; // For backward compatibility
  loanStatus: LoanStatus; // Actual backend field
  applicationDate?: string;
  approvalDate?: string;
  disbursementDate?: string;
  dueDate?: string;
  loanOfficerId: number;
  loanOfficerName: string;
  customerPhoneNumber?: string;
  loanReference?: string;
  createdAt?: string; // For backward compatibility
  dateCreated?: string; // Actual backend field
  updatedAt?: string;
}

export interface LoanOfficer {
  loanOfficerId: number; // Backend uses loanOfficerId, not id
  id?: number; // Backward compatibility
  firstName: string;
  middleName?: string;
  lastName: string;
  otherNames?: string;
  fullName: string;
  username: string;
  email?: string; // Backend doesn't provide email
  phoneNumber: string;
  active: boolean; // Backend uses active, not isActive
  isActive?: boolean; // Backward compatibility
  passwordChanged?: boolean; // Backend field
  customersCount?: number; // May not be in all responses
  loansCount?: number; // May not be in all responses
  dateCreated?: string; // Backend uses dateCreated
  createdAt?: string; // Backward compatibility
}

export interface CreateLoanDTO {
  customerId: number;
  principalAmount: number;
  tenureValue: number;
  tenureUnit: TenureUnit;
  disbursementDate: string;
  disbursementCost: number;
  disbursementMethod: DisbursementMethod;
  loanOfficerId: number;
}

export interface LoanDetail extends Loan {
  disbursementCost?: number;
  disbursementMethod: DisbursementMethod;
  tenureValue?: number;
  tenureUnit?: TenureUnit;
  installmentAmount?: number;
  totalRepaid?: number;
  totalAmount?: number; // totalLoanAmount is used
  outstandingBalance?: number | null;
  repaymentPercentage?: number;
  arrearsAmount?: number;
  arrears?: number; // Backend field
  totalPaid?: number; // Backend field
  remainingToSeventyPercent?: number; // Backend field
}

export interface LoanSchedule {
  scheduleId: number; // Backend uses scheduleId, not id
  id?: number; // Backward compatibility
  loanId?: number; // May not be in response
  installmentNumber?: number; // Not in backend response
  dueDate: string;
  expectedAmount: number; // Backend field for total due
  paidAmount: number; // Backend field for total paid
  remainingAmount: number; // Backend field for outstanding balance
  offTrack: boolean; // Backend field indicating if payment is late
  // Legacy fields for backward compatibility
  principalDue?: number;
  interestDue?: number;
  totalDue?: number;
  principalPaid?: number;
  interestPaid?: number;
  totalPaid?: number;
  outstandingBalance?: number;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';
}

export interface LoanRepayment {
  id?: number;
  repaymentId?: number;
  loanId?: number;
  amount?: number;
  amountPaid?: number;
  paymentDate: string;
  paymentMethod?: string;
  paymentChannel?: string;
  transactionReference?: string;
  mpesaReference?: string;
  principalAmount?: number;
  principalPaid?: number;
  interestAmount?: number;
  interestPaid?: number;
  penaltyAmount?: number;
  penaltyPaid?: number;
  notes?: string;
  createdAt?: string;
}

export interface LoanCalculatorRequest {
  principalAmount: number;
  tenureValue: number;
  tenureUnit: TenureUnit;
}

export interface LoanCalculatorResponse {
  principalAmount: number;
  interestRate: number;
  interestAmount: number;
  totalAmount: number;
  installmentAmount: number;
  numberOfInstallments: number;
  tenureValue: number;
  tenureUnit: TenureUnit;
}

export interface LoanTopUpRequest {
  loanId: number;
  topUpAmount: number;
  tenureValue: number;
  tenureUnit: TenureUnit;
}

export interface CreateLoanOfficerDTO {
  firstName: string;
  middleName?: string;
  lastName: string;
  otherNames?: string;
  username: string;
  phoneNumber: string;
}

export interface LoanFilters {
  customerId?: number;
  loanReference?: string;
  loanStatus?: LoanStatus;
  loanOfficerId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalLoans: number;
  activeLoans: number;
  totalDisbursed: number;
  pendingApprovals: number;
  defaultedLoans: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
