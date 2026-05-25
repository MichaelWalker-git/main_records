import { RecordType, RecordTag } from './records';
import { DispositionAction } from './workflows';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
}

export interface CreateRecordDto {
  type: RecordType;
  title: string;
  description?: string;
  agencyId: string;
  departmentId?: string;
  retentionScheduleId?: string;
  templateId?: string;
  barcode?: string;
  locationId?: string;
  tags?: RecordTag[];
  customFields?: Record<string, string | number | boolean>;
}

export interface UpdateRecordDto {
  title?: string;
  description?: string;
  retentionScheduleId?: string;
  tags?: RecordTag[];
  customFields?: Record<string, string | number | boolean>;
}

export interface CreateTransmittalDto {
  agencyId: string;
  items: CreateTransmittalItemDto[];
  notes?: string;
  targetLocationId?: string;
}

export interface CreateTransmittalItemDto {
  recordId: string;
  description: string;
  boxNumber?: string;
}

export interface CreateDispositionDto {
  recordId: string;
  action: DispositionAction;
  retentionScheduleId: string;
  eligibleDate: string;
}

export interface CreateLegalHoldDto {
  name: string;
  description?: string;
  caseNumber?: string;
  recordIds: string[];
}

export interface CreateReferenceRequestDto {
  subject: string;
  description: string;
  recordIds?: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors?: { id: string; error: string }[];
}
