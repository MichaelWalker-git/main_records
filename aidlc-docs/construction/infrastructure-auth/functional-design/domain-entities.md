# Domain Entities - Unit 1: Infrastructure & Auth

## User Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| cognitoSub | string | Unique, from Cognito |
| email | string | Unique, required |
| firstName | string | Required |
| lastName | string | Required |
| agencyId | UUID | FK → agencies, nullable (admins may not have agency) |
| status | enum | ACTIVE, INACTIVE, LOCKED |
| mfaEnabled | boolean | Default true |
| lastLogin | timestamp | Nullable |
| createdAt | timestamp | Auto |
| updatedAt | timestamp | Auto |

## Role Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| name | string | Unique: SYSTEM_ADMIN, ARCHIVES_STAFF, RECORDS_OFFICER, AGENCY_STAFF |
| description | string | Human-readable |
| permissions | jsonb | Permission set (module → actions) |

## Agency Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| code | string(3) | Unique, 3-char agency code |
| name | string | Required (e.g., "Department of Health and Human Services") |
| abbreviation | string | Short name (e.g., "DHHS") |
| status | enum | ACTIVE, INACTIVE |
| createdAt | timestamp | Auto |

## Permission Model
```
Permissions are stored as JSONB on the Role:
{
  "records": ["create", "read", "update", "delete", "classify"],
  "transmittals": ["create", "read", "approve", "reject", "receive"],
  "dispositions": ["create", "read", "approve", "reject", "legal_hold"],
  "inventory": ["read", "assign", "relocate", "checkout", "checkin"],
  "search": ["metadata", "fulltext", "semantic"],
  "analytics": ["view", "export", "create_template"],
  "users": ["create", "read", "update", "deactivate", "assign_role"],
  "integrations": ["view", "configure", "sync"],
  "audit": ["view", "export"]
}
```

## Default Role Permissions
| Module | SYSTEM_ADMIN | ARCHIVES_STAFF | RECORDS_OFFICER | AGENCY_STAFF |
|--------|-------------|----------------|-----------------|--------------|
| records | ALL | ALL except delete | create, read, update | read |
| transmittals | ALL | ALL | create, read | read |
| dispositions | ALL | create, read, approve | read | - |
| inventory | ALL | ALL | read, checkout, checkin | - |
| search | ALL | ALL | metadata, fulltext | metadata |
| analytics | ALL | view, export | view (own agency) | - |
| users | ALL | read | read (own agency) | - |
| integrations | ALL | view | - | - |
| audit | ALL | view | - | - |

## Cognito Configuration
| Setting | Value |
|---------|-------|
| Pool Name | maine-rms-{stage} |
| Username | Email |
| MFA | Required (TOTP) |
| Password Policy | Min 12 chars, upper+lower+number+special |
| Token Validity | Access: 1hr, Refresh: 30 days |
| Custom Attributes | role, agencyId, agencyCode |
| Groups | SystemAdmin, ArchivesStaff, RecordsOfficer, AgencyStaff |
| Identity Provider | SAML (mocked for demo with Cognito hosted UI) |

## Demo Users (Pre-provisioned)
| Email | Name | Role | Agency |
|-------|------|------|--------|
| sarah.chen@maine.gov | Sarah Chen | SYSTEM_ADMIN | None (all access) |
| michael.torres@maine.gov | Michael Torres | ARCHIVES_STAFF | Maine State Archives |
| diana.patel@maine.gov | Diana Patel | RECORDS_OFFICER | DHHS |
| james.wright@maine.gov | James Wright | AGENCY_STAFF | DHHS |
