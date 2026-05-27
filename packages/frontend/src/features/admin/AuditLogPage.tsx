import { useState } from 'react';
import { DataTable } from '../../components/DataTable';
import { SearchInput } from '../../components/SearchInput';
import { ExportButton } from '../../components/ExportButton';
import { exportAuditLog } from '../../utils/export';
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
    { key: 'createdAt', label: 'Time', sortable: true, render: (e: AuditEvent) => format(new Date(e.createdAt), 'MMM d, yyyy HH:mm:ss') },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'resourceType', label: 'Resource Type' },
    { key: 'resourceId', label: 'Resource ID', render: (e: AuditEvent) => (
      <span className="font-mono text-xs">{e.resourceId || '-'}</span>
    )},
    { key: 'userEmail', label: 'User', sortable: true },
  ];

  return (
    <div data-testid="audit-log-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">System activity and access history</p>
        </div>
        <ExportButton onExport={exportAuditLog} />
      </div>

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex-1">
            <SearchInput placeholder="Search audit events..." onSearch={setSearch} />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-8 px-2 border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
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
    </div>
  );
}
