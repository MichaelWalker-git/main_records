import { RoleName, Permission } from '../types/users';

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  [RoleName.SYSTEM_ADMIN]: [
    { module: 'records', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'] },
    { module: 'transmittals', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'] },
    { module: 'dispositions', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'] },
    { module: 'inventory', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
    { module: 'users', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
    { module: 'analytics', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
    { module: 'audit', actions: ['READ'] },
    { module: 'legal_holds', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
    { module: 'reference_requests', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  ],
  [RoleName.ARCHIVES_STAFF]: [
    { module: 'records', actions: ['CREATE', 'READ', 'UPDATE'] },
    { module: 'transmittals', actions: ['CREATE', 'READ', 'UPDATE', 'APPROVE'] },
    { module: 'dispositions', actions: ['CREATE', 'READ', 'UPDATE', 'APPROVE'] },
    { module: 'inventory', actions: ['CREATE', 'READ', 'UPDATE'] },
    { module: 'analytics', actions: ['READ'] },
    { module: 'audit', actions: ['READ'] },
    { module: 'legal_holds', actions: ['CREATE', 'READ', 'UPDATE'] },
    { module: 'reference_requests', actions: ['CREATE', 'READ', 'UPDATE'] },
  ],
  [RoleName.RECORDS_OFFICER]: [
    { module: 'records', actions: ['CREATE', 'READ', 'UPDATE'] },
    { module: 'transmittals', actions: ['CREATE', 'READ', 'UPDATE'] },
    { module: 'dispositions', actions: ['CREATE', 'READ'] },
    { module: 'inventory', actions: ['READ'] },
    { module: 'analytics', actions: ['READ'] },
    { module: 'reference_requests', actions: ['CREATE', 'READ'] },
  ],
  [RoleName.AGENCY_STAFF]: [
    { module: 'records', actions: ['CREATE', 'READ'] },
    { module: 'transmittals', actions: ['CREATE', 'READ'] },
    { module: 'reference_requests', actions: ['CREATE', 'READ'] },
  ],
};
