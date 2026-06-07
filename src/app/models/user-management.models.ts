export type MerchantOperationsRole = 'MERCHANT_MANAGER' | 'MERCHANT_EMPLOYEE';

export interface UserSearchResult {
  id: string;
  displayName: string;
  email: string | null;
  enabled: boolean;
  groups?: UserGroupMembership[];
}

export interface UserGroupMembership {
  id: string | null;
  merchantName: string;
  branchName: string | null;
}

export interface MerchantUserAssignment {
  id: string;
  merchantId: string;
  merchantName: string;
  branchId: string | null;
  branchName: string | null;
  role: MerchantOperationsRole;
  employeeId: string | null;
}

export interface CreateAssignmentRequest {
  merchantId: string;
  branchId: string | null;
  role: MerchantOperationsRole;
  employeeId: string | null;
}
