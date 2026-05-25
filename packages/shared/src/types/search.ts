import { RecordType, RecordStatus, ClassificationStatus } from './records';

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  facets?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  recordType?: RecordType;
  status?: RecordStatus;
  classificationStatus?: ClassificationStatus;
  agencyId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  warehouseId?: string;
}

export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  facets?: FacetResult[];
  queryTimeMs: number;
}

export interface FacetResult {
  field: string;
  buckets: FacetBucket[];
}

export interface FacetBucket {
  key: string;
  count: number;
}
