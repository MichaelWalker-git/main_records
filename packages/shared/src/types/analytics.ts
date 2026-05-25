export interface DashboardMetrics {
  totalRecords: number;
  recordsByType: { physical: number; digital: number };
  recordsByStatus: Record<string, number>;
  pendingTransmittals: number;
  pendingDispositions: number;
  activeHolds: number;
  warehouseUtilization: number;
  recentActivity: ActivitySummary[];
  generatedAt: string;
}

export interface ActivitySummary {
  date: string;
  recordsCreated: number;
  recordsDisposed: number;
  transmittalsSubmitted: number;
  searchesPerformed: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'INVENTORY' | 'DISPOSITION' | 'TRANSMITTAL' | 'ACTIVITY' | 'COMPLIANCE';
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'date' | 'select' | 'text' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface ReportSchedule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  recipients: string[];
  lastRunAt?: string;
  nextRunAt: string;
}
