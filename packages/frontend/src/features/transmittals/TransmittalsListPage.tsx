import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { usePaginatedQuery } from '../../hooks/useApi';
import { Transmittal } from '../../types';
import { format } from 'date-fns';

export function TransmittalsListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = usePaginatedQuery<Transmittal>(
    ['transmittals'],
    '/transmittals',
    { page, pageSize: 25, status: statusFilter || undefined }
  );

  const columns = [
    { key: 'trackingNumber', label: 'Tracking #', sortable: true, render: (t: Transmittal) => (
      <span className="font-mono text-xs text-slate-500">{t.trackingNumber}</span>
    )},
    { key: 'agencyName', label: 'Agency', sortable: true },
    { key: 'itemCount', label: 'Items', render: (t: Transmittal) => (
      <span className="tabular-nums">{t.itemCount}</span>
    )},
    { key: 'status', label: 'Status', render: (t: Transmittal) => <StatusBadge status={t.status} /> },
    { key: 'submittedAt', label: 'Submitted', render: (t: Transmittal) => t.submittedAt ? format(new Date(t.submittedAt), 'MMM d, yyyy') : <span className="text-slate-400">—</span> },
    { key: 'actions', label: '', render: (t: Transmittal) => (
      <Link to={`/transmittals/${t.id}`} className="text-navy-500 hover:text-navy-700 text-sm font-medium" data-testid={`view-transmittal-${t.id}`}>
        View
      </Link>
    )},
  ];

  return (
    <div data-testid="transmittals-list-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Transmittals</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track record transfers between agencies and archives</p>
        </div>
        <Link
          to="/transmittals/new"
          className="flex items-center gap-1.5 h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 transition-colors"
          data-testid="submit-transmittal-button"
        >
          <PlusIcon className="w-4 h-4" />
          New Transmittal
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <FunnelIcon className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            data-testid="transmittal-status-filter"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="received">Received</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(t) => t.id}
          isLoading={isLoading}
          pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages } : undefined}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}