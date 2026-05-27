import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { usePaginatedQuery } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Transmittal } from '../../types';
import { format } from 'date-fns';

function OwnershipBadge({ transmittal, isArchivesStaff }: { transmittal: any; isArchivesStaff: boolean }) {
  // Only render when the badge adds information beyond StatusBadge — i.e. tells the
  // viewer who is supposed to act next. Skip for terminal and self-evident states.
  if (transmittal.status === 'submitted' && isArchivesStaff) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-navy-700 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5">
        <ExclamationCircleIcon className="w-3 h-3" />
        Awaiting your action
      </span>
    );
  }

  if (transmittal.status === 'submitted' && !isArchivesStaff) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
        Awaiting Archives review
      </span>
    );
  }

  if (transmittal.status === 'received' && isArchivesStaff) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
        <ExclamationCircleIcon className="w-3 h-3" />
        Pending your approval
      </span>
    );
  }

  return null;
}

export function TransmittalsListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { isAdmin, isStaff } = useAuth();
  const isArchivesStaff = isAdmin || isStaff;

  const { data, isLoading } = usePaginatedQuery<Transmittal>(
    ['transmittals'],
    '/transmittals',
    { page, pageSize: 25, status: statusFilter || undefined }
  );

  const columns = [
    { key: 'title', label: 'Transmittal', sortable: true, render: (t: any) => (
      <div className="min-w-0">
        <Link to={`/transmittals/${t.id}`} className="text-navy-500 hover:text-navy-700 font-medium text-sm block truncate" data-testid={`transmittal-link-${t.id}`}>
          {t.title || t.trackingNumber || '—'}
        </Link>
        <span className="text-[11px] text-slate-400">{t.agencyName || t.agencyId || '—'}</span>
      </div>
    )},
    { key: 'submittedByName', label: 'Sender', render: (t: any) => (
      <span className="text-sm text-slate-600">{t.submittedByName || t.submitted_by_name || '—'}</span>
    )},
    { key: 'itemCount', label: 'Items', render: (t: any) => (
      <span className="tabular-nums text-sm">{t.itemCount ?? t.item_count ?? 0} boxes</span>
    )},
    { key: 'status', label: 'Status', render: (t: any) => (
      <div className="flex flex-col gap-1">
        <StatusBadge status={t.status} />
        <OwnershipBadge transmittal={t} isArchivesStaff={isArchivesStaff} />
      </div>
    )},
    { key: 'submittedAt', label: 'Submitted', render: (t: any) => {
      const date = t.submittedAt || t.submitted_at;
      if (!date) return <span className="text-slate-400 text-sm">—</span>;
      try { return <span className="text-sm">{format(new Date(date), 'MMM d, yyyy')}</span>; }
      catch { return <span className="text-slate-400 text-sm">—</span>; }
    }},
    { key: 'actions', label: '', render: (t: any) => (
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
          <p className="text-sm text-slate-500 mt-0.5">Track record transfers from agencies to State Archives</p>
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
