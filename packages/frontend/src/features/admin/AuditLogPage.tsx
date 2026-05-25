import { useState } from 'react';
import { DataTable } from '../../components/DataTable';
import { SearchInput } from '../../components/SearchInput';
import { ExportButton } from '../../components/ExportButton';
import { usePaginatedQuery } from '../../hooks/useApi';
import { AuditEvent } from '../../types';
import { format } from 'date-fns';

export function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = usePaginatedQuery<AuditEvent>(
    ['audit-log'],
    '/admin/audit-log',
    { page, pageSize: 50, search, action: actionFilter || undefined }
  );

  const columns = [
    { key: 'timestamp', label: 'Time', sortable: true, render: (e: AuditEvent) => format(new Date(e.timestamp), 'MMM d, yyyy HH:mm:ss') },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'entityType', label: 'Entity Type' },
    { key: 'entityId', label: 'Entity ID', render: (e: AuditEvent) => (
      <span className="font-mono text-xs">{e.entityId}</span>
    )},
    { key: 'userName', label: 'User', sortable: true },
    { key: 'ipAddress', label: 'IP Address', render: (e: AuditEvent) => (
      <span className="font-mono text-xs">{e.ipAddress || '-'}</span>
    )},
  ];

  return (
    <div data-testid="audit-log-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
        <ExportButton onExport={() => {}} />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <SearchInput placeholder="Search audit events..." onSearch={setSearch} />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          data-testid="action-filter"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
        </select>
      </div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(e) => e.id}
        isLoading={isLoading}
        pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages } : undefined}
        onPageChange={setPage}
      />
    </div>
  );
}
