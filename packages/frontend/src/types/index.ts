export type UserRole = 'admin' | 'staff' | 'records_officer' | 'agency_user' | 'viewer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  agencyId?: string;
  agencyName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type RecordStatus = 'active' | 'inactive' | 'pending_disposition' | 'transferred' | 'destroyed' | 'on_hold';

export interface RMSRecord {
  id: string;
  trackingNumber: string;
  title: string;
  description?: string;
  seriesId: string;
  seriesTitle: string;
  agencyId: string;
  agencyName: string;
  status: RecordStatus;
  locationId?: string;
  locationPath?: string;
  barcode?: string;
  retentionScheduleId?: string;
  dispositionDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  metadata: Record<string, unknown> | object;
}

export type TransmittalStatus = 'draft' | 'submitted' | 'received' | 'approved' | 'rejected';

export interface Transmittal {
  id: string;
  trackingNumber: string;
  agencyId: string;
  agencyName: string;
  status: TransmittalStatus;
  submittedBy: string;
  submittedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  itemCount: number;
  notes?: string;
  items: TransmittalItem[];
  createdAt: string;
}

export interface TransmittalItem {
  id: string;
  transmittalId: string;
  recordId?: string;
  boxNumber: string;
  description: string;
  seriesTitle: string;
  dateRange: string;
}

export type DispositionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'on_hold';

export interface Disposition {
  id: string;
  title: string;
  status: DispositionStatus;
  method: 'destroy' | 'transfer' | 'archive';
  scheduledDate: string;
  approvalChain: ApprovalStep[];
  recordCount: number;
  agencyId: string;
  agencyName: string;
  legalHold: boolean;
  createdAt: string;
}

export interface ApprovalStep {
  id: string;
  userId: string;
  userName: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedAt?: string;
  comment?: string;
}

export interface LegalHold {
  id: string;
  title: string;
  reason: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  recordIds: string[];
  isActive: boolean;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  type: 'warehouse' | 'room' | 'aisle' | 'shelf' | 'position';
  capacity: number;
  occupied: number;
  children?: Location[];
}

export interface RetentionSchedule {
  id: string;
  code: string;
  title: string;
  description: string;
  retentionYears: number;
  dispositionMethod: 'destroy' | 'transfer' | 'archive';
  isActive: boolean;
}

export interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: object;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  type: 'record' | 'transmittal' | 'disposition';
  title: string;
  snippet: string;
  score: number;
  highlights: string[];
  record?: RMSRecord;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}
