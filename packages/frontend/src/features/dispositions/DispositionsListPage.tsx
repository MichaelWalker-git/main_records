import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { usePaginatedQuery } from '../../hooks/useApi';
import { Disposition } from '../../types';
import { format } from 'date-fns';

export function DispositionsListPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const { data, isLoading } = usePaginatedQuery<Disposition>(
    ['dispositions', tab],
    '/dispositions',
    { page, pageSize: 25, status: tab === 'pending' ? 'pending' : undefined }
  );

  const columns = [
    { key: 'title', label: 'Title', sortable: true, render: (d: Disposition) => (
      <Link to={`/dispositions/${d.id}`} className="text-navy-500 hover:underline" data-testid={`disposition-link-${d.id}`}>
        {d.title}
      </Link>
    )},
    { key: 'agencyName', label: 'Agency', sortable: true },
    { key: 'method', label: 'Method', render: (d: Disposition) => (
      <span className="capitalize">{d.method}</span>
    )},
    { key: 'recordCount', label: 'Records' },
    { key: 'scheduledDate', label: 'Scheduled', render: (d: Disposition) => format(new Date(d.scheduledDate), 'MMM d, yyyy') },
    { key: 'status', label: 'Status', render: (d: Disposition) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={d.status} />
        {d.legalHold && <span className="text-xs text-orange-600 font-medium">HOLD</span>}
      </div>
    )},
  ];

  return (
    <div data-testid="dispositions-list-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dispositions</h1>
        <Link
          to="/dispositions/legal-holds"
          className="text-sm text-navy-500 hover:underline font-medium"
          data-testid="legal-holds-link"
        >
          Legal Holds
        </Link>
      </div>
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'pending' ? 'border-navy-500 text-navy-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          data-testid="tab-pending"
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'history' ? 'border-navy-500 text-navy-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          data-testid="tab-history"
        >
          History
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(d) => d.id}
        isLoading={isLoading}
        pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages } : undefined}
        onPageChange={setPage}
      />
    </div>
  );
}
