# User Personas - Maine Records Management System

## Persona 1: Sarah Chen - System Administrator
| Attribute | Detail |
|-----------|--------|
| **Role** | System Administrator |
| **Organization** | Maine State Archives (Department of Secretary of State) |
| **Goals** | Manage platform configuration, user accounts, security settings, and system health |
| **Frustrations** | Manual user provisioning, lack of visibility into system usage, compliance reporting burden |
| **Tech Comfort** | High - comfortable with admin consoles, AWS services, RBAC configuration |
| **Key Workflows** | User management, role assignment, retention schedule configuration, system monitoring, audit log review |
| **Access Level** | Full system access - all modules, all locations |

## Persona 2: Michael Torres - Archives Staff (Records Analyst)
| Attribute | Detail |
|-----------|--------|
| **Role** | Archives Staff / Records Analyst |
| **Organization** | Maine State Archives |
| **Goals** | Process transmittals, manage warehouse inventory, fulfill reference requests, approve dispositions |
| **Frustrations** | Paper-based transmittal forms, manual box tracking, inability to quickly locate records |
| **Tech Comfort** | Moderate - uses web applications daily, familiar with barcode scanners |
| **Key Workflows** | Receive transmittals, assign warehouse locations, process reference requests, barcode scanning, disposition approval |
| **Access Level** | All records, all warehouse locations, workflow approvals |

## Persona 3: Diana Patel - Records Officer (Agency)
| Attribute | Detail |
|-----------|--------|
| **Role** | Designated Records Officer |
| **Organization** | Maine Department of Health and Human Services (example agency) |
| **Goals** | Submit accession requests, track transfers, manage agency retention compliance |
| **Frustrations** | No visibility into transfer status, manual box inventory, missed retention deadlines |
| **Tech Comfort** | Moderate - uses Microsoft 365 daily, comfortable with web portals |
| **Key Workflows** | Create transmittals, submit accession requests, track transfers, view retention alerts, check out records |
| **Access Level** | Own agency records only, self-service portal, limited search |

## Persona 4: James Wright - Agency Staff (General User)
| Attribute | Detail |
|-----------|--------|
| **Role** | Agency Staff Member |
| **Organization** | Any Maine state agency |
| **Goals** | Submit reference requests, check record status, view agency records |
| **Frustrations** | Long wait times for record retrieval, no status visibility |
| **Tech Comfort** | Basic - uses email and web browsers |
| **Key Workflows** | Submit reference requests, check request status, view available records |
| **Access Level** | Read-only access to own agency records, reference request submission |

## Persona Interaction Map

```
+------------------+     Configures     +------------------+
| Sarah Chen       |-------------------->| System Settings  |
| (Sys Admin)      |                     | Users & Roles    |
+------------------+                     +------------------+
        |
        | Manages
        v
+------------------+     Processes      +------------------+
| Michael Torres   |-------------------->| Transmittals     |
| (Archives Staff) |                     | Inventory        |
+------------------+                     | Dispositions     |
        ^                                | Ref Requests     |
        |                                +------------------+
        | Submits to
        |
+------------------+     Self-Service   +------------------+
| Diana Patel      |-------------------->| Accession Forms  |
| (Records Officer)|                     | Transfer Track   |
+------------------+                     | Retention Alerts |
        ^                                +------------------+
        |
        | Reports to
        |
+------------------+     Portal         +------------------+
| James Wright     |-------------------->| Reference Req    |
| (Agency Staff)   |                     | Status Check     |
+------------------+                     +------------------+
```
