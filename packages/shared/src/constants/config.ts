export const CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.85;

export const MAX_BATCH_SIZE = 500;

export const ALERT_THRESHOLDS = {
  warehouseUtilization: 0.9,
  pendingDispositions: 100,
  overdueCheckouts: 7,
  failedClassifications: 10,
};

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 25,
  maxPageSize: 100,
};

export const RETENTION_REVIEW_DAYS_BEFORE = 90;

export const FILE_UPLOAD = {
  maxSizeMb: 500,
  allowedMimeTypes: [
    'application/pdf',
    'image/tiff',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
};

export const SEARCH = {
  maxQueryLength: 500,
  defaultFacets: ['recordType', 'status', 'agencyId', 'classificationStatus'],
  highlightTag: 'em',
};
