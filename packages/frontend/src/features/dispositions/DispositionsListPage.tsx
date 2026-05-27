import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
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
    { key: 'title', label: 'Title', sortable: true, render: (d: any) => (
      <Link to={`/dispositions/${d.id}`} className="text-navy-500 hover:text-navy-700 font-medium" data-testid={`disposition-link-${d.id}`}>
        {d.title}
      </Link>
    )},
    { key: 'agencyId', label: 'Agency', sortable: true, render: (d: any) => (
      <span>{d.agencyName || d.agencyId || '—'}</span>
    )},
    { key: 'dispositionAction', label: 'Method', render: (d: any) => (
      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">{d.dispositionAction || d.method || '—'}</span>
    )},
    { key: 'initiatedAt', label: 'Initiated', render: (d: any) => {
      const date = d.scheduledDate || d.initiatedAt || d.createdAt;
      if (!date) return <span>—</span>;
      try { return <span>{format(new Date(date), 'MMM d, yyyy')}</span>; }
      catch { return <span>—</span>; }
    }},
    { key: 'status', label: 'Status', render: (d: any) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={d.status} />
        {d.legalHold && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">Hold</span>}
      </div>
    )},
  ];

  return (
    <div data-testid="dispositions-list-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dispositions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage record disposition approvals and scheduling</p>
        </div>
        <Link
          to="/dispositions/legal-holds"
          className="flex items-center gap-1.5 h-9 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          data-testid="legal-holds-link"
        >
          <ShieldExclamationIcon className="w-4 h-4" />
          Legal Holds
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="flex gap-0.5 px-4 pt-3 border-b border-slate-100">
          <button
            onClick={() => setTab('pending')}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'pending' ? 'border-navy-500 text-navy-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            data-testid="tab-pending"
          >
            Pending Approvals
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'history' ? 'border-navy-500 text-navy-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
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
    </div>
  );
}