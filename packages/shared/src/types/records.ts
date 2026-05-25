export enum RecordStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
  IN_TRANSIT = 'IN_TRANSIT',
  DISPOSED = 'DISPOSED',
  ON_HOLD = 'ON_HOLD',
}

export enum RecordType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
}

export enum ClassificationStatus {
  PENDING = 'PENDING',
  CLASSIFIED = 'CLASSIFIED',
  MANUAL = 'MANUAL',
}

export interface RecordTag {
  id: string;
  name: string;
  color?: string;
}

export interface RecordMetadata {
  title: string;
  description?: string;
  creator: string;
  dateCreated: string;
  dateModified: string;
  retentionScheduleId?: string;
  classificationId?: string;
  classificationStatus: ClassificationStatus;
  classificationConfidence?: number;
  agencyId: string;
  departmentId?: string;
  tags: RecordTag[];
  customFields?: Record<string, string | number | boolean>;
}

export interface RMSRecord {
  id: string;
  type: RecordType;
  status: RecordStatus;
  metadata: RecordMetadata;
  locationId?: string;
  s3Key?: string;
  barcode?: string;
  templateId?: string;
  legalHoldId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface RecordTemplate {
  id: string;
  name: string;
  description?: string;
  recordType: RecordType;
  fields: RecordTemplateField[];
  agencyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordTemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}
