export enum TransmittalStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  SHELVED = 'SHELVED',
}

export enum DispositionStatus {
  PENDING_L1 = 'PENDING_L1',
  PENDING_L2 = 'PENDING_L2',
  PENDING_L3 = 'PENDING_L3',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
}

export enum DispositionAction {
  DESTROY = 'DESTROY',
  TRANSFER_TO_ARCHIVES = 'TRANSFER_TO_ARCHIVES',
  EXTEND = 'EXTEND',
}

export enum ReferenceRequestStatus {
  SUBMITTED = 'SUBMITTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CirculationEventType {
  CHECKOUT = 'CHECKOUT',
  CHECKIN = 'CHECKIN',
}

export interface TransmittalItem {
  id: string;
  transmittalId: string;
  recordId: string;
  barcode?: string;
  description: string;
  boxNumber?: string;
  status: TransmittalStatus;
}

export interface Transmittal {
  id: string;
  status: TransmittalStatus;
  agencyId: string;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  items: TransmittalItem[];
  notes?: string;
  targetLocationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Disposition {
  id: string;
  recordId: string;
  action: DispositionAction;
  status: DispositionStatus;
  retentionScheduleId: string;
  eligibleDate: string;
  approvals: DispositionApproval[];
  executedAt?: string;
  executedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DispositionApproval {
  level: number;
  approverId: string;
  approvedAt?: string;
  decision?: 'APPROVED' | 'REJECTED';
  comments?: string;
}

export interface LegalHold {
  id: string;
  name: string;
  description?: string;
  caseNumber?: string;
  issuedBy: string;
  issuedAt: string;
  releasedAt?: string;
  recordIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CirculationEvent {
  id: string;
  recordId: string;
  type: CirculationEventType;
  userId: string;
  checkedOutAt?: string;
  dueDate?: string;
  checkedInAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ReferenceRequest {
  id: string;
  requesterId: string;
  assigneeId?: string;
  status: ReferenceRequestStatus;
  subject: string;
  description: string;
  recordIds?: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  submittedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
