export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export enum RoleName {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  ARCHIVES_STAFF = 'ARCHIVES_STAFF',
  RECORDS_OFFICER = 'RECORDS_OFFICER',
  AGENCY_STAFF = 'AGENCY_STAFF',
}

export interface Permission {
  module: string;
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'APPROVE')[];
}

export interface Role {
  id: string;
  name: RoleName;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  roleId: string;
  roleName: RoleName;
  agencyId: string;
  cognitoId: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
