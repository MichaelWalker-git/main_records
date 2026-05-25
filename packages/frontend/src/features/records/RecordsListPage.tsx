import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
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
    { key: 'trackingNumber', label: 'Tracking #', sortable: true },
    { key: 'title', label: 'Title', sortable: true, render: (r: Record) => (
      <Link to={`/records/${r.id}`} className="text-navy-500 hover:underline" data-testid={`record-link-${r.id}`}>
        {r.title}
      </Link>
    )},
    { key: 'seriesTitle', label: 'Series', sortable: true },
    { key: 'agencyName', label: 'Agency', sortable: true },
    { key: 'status', label: 'Status', render: (r: Record) => <StatusBadge status={r.status} /> },
    { key: 'locationPath', label: 'Location' },
  ];

  return (
    <div data-testid="records-list-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Records</h1>
        <div className="flex items-center gap-3">
          <ExportButton onExport={() => {}} />
          <Link
            to="/records/new"
            className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600"
            data-testid="create-record-button"
          >
            <PlusIcon className="w-4 h-4" />
            New Record
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <SearchInput placeholder="Search records..." onSearch={setSearch} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
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
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages } : undefined}
        onPageChange={setPage}
      />
    </div>
  );
}
