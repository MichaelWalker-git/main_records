import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchInput } from '../../components/SearchInput';
import { ExportButton } from '../../components/ExportButton';
import { usePaginatedQuery } from '../../hooks/useApi';
import { RMSRecord as Record } from '../../types';

export function RecordsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = usePaginatedQuery<Record>(
    ['records'],
    '/records',
    { page, pageSize: 25, search, status: statusFilter || undefined }
  );

  const columns = [
    { key: 'trackingNumber', label: 'Tracking #', sortable: true, render: (r: Record) => (
      <span className="font-mono text-xs text-slate-500">{r.trackingNumber}</span>
    )},
    { key: 'title', label: 'Title', sortable: true, render: (r: Record) => (
      <Link to={`/records/${r.id}`} className="text-navy-500 hover:text-navy-700 font-medium hover:underline" data-testid={`record-link-${r.id}`}>
        {r.title}
      </Link>
    )},
    { key: 'seriesTitle', label: 'Series', sortable: true },
    { key: 'agencyName', label: 'Agency', sortable: true },
    { key: 'status', label: 'Status', render: (r: Record) => <StatusBadge status={r.status} /> },
    { key: 'locationPath', label: 'Location', render: (r: Record) => (
      <span className="text-slate-500">{r.locationPath || '—'}</span>
    )},
  ];

  return (
    <div data-testid="records-list-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data?.total ? `${data.total.toLocaleString()} total records` : 'Manage records lifecycle'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={() => {}} />
          <Link
            to="/records/new"
            className="flex items-center gap-1.5 h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 transition-colors"
            data-testid="create-record-button"
          >
            <PlusIcon className="w-4 h-4" />
            New Record
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex-1">
            <SearchInput placeholder="Search by title, tracking number, or keyword..." onSearch={setSearch} />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
              data-testid="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending_disposition">Pending Disposition</option>
              <option value="transferred">Transferred</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages } : undefined}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}