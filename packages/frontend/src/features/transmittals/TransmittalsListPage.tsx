import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
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
    { key: 'trackingNumber', label: 'Tracking #', sortable: true },
    { key: 'agencyName', label: 'Agency', sortable: true },
    { key: 'itemCount', label: 'Items' },
    { key: 'status', label: 'Status', render: (t: Transmittal) => <StatusBadge status={t.status} /> },
    { key: 'submittedAt', label: 'Submitted', render: (t: Transmittal) => t.submittedAt ? format(new Date(t.submittedAt), 'MMM d, yyyy') : '-' },
    { key: 'actions', label: '', render: (t: Transmittal) => (
      <Link to={`/transmittals/${t.id}`} className="text-navy-500 hover:underline text-sm" data-testid={`view-transmittal-${t.id}`}>
        View
      </Link>
    )},
  ];

  return (
    <div data-testid="transmittals-list-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Transmittals</h1>
        <Link
          to="/transmittals/new"
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600"
          data-testid="submit-transmittal-button"
        >
          <PlusIcon className="w-4 h-4" />
          New Transmittal
        </Link>
      </div>
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
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
  );
}
