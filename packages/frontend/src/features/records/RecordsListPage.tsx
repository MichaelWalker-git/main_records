import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, FunnelIcon, PencilIcon, TagIcon, TrashIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchInput } from '../../components/SearchInput';
import { ExportButton } from '../../components/ExportButton';
import { EmptyState } from '../../components/EmptyState';
import { KpiCard } from '../../components/KpiCard';
import { ConfidenceMeter } from '../../components/ConfidenceMeter';
import { usePaginatedQuery, useApiQuery } from '../../hooks/useApi';
import { exportRecords } from '../../utils/export';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { RMSRecord as Record } from '../../types';

export function RecordsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { isAdmin, isStaff, isOfficer } = useAuth();
  const canEdit = isAdmin || isStaff || isOfficer;
  const canClassify = isAdmin || isStaff;
  const canDelete = isAdmin;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function handleClassify(id: string) {
    try {
      await api.post(`/records/${id}/classify`);
      toast('Classification initiated. AI is processing...', 'success');
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch { toast('Classification failed.', 'error'); }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ title: 'Delete Record', description: 'Are you sure you want to delete this record? This cannot be undone.', confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/records/${id}`);
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch { toast('Delete failed.', 'error'); }
  }

  const { data: statsRaw } = useApiQuery<any>(['analytics-dashboard'], '/analytics/dashboard');
  const stats = statsRaw?.data ?? statsRaw ?? {};

  const { data, isLoading } = usePaginatedQuery<Record>(
    ['records'],
    '/records',
    { page, pageSize: 25, search, status: statusFilter || undefined }
  );

  const columns = [
    { key: 'title', label: 'Record', sortable: true, render: (r: Record) => (
      <div className="min-w-0">
        <Link to={`/records/${r.id}`} className="text-navy-500 hover:text-navy-700 font-medium hover:underline block truncate" data-testid={`record-link-${r.id}`}>
          {r.title}
        </Link>
        <span className="text-[11px] text-slate-400 font-mono">{r.trackingNumber}</span>
      </div>
    )},
    { key: 'seriesTitle', label: 'Series', sortable: true, render: (r: Record) => (
      <span className="text-sm text-slate-600 truncate block max-w-[180px]">{r.seriesTitle || '—'}</span>
    )},
    { key: 'aiConfidence', label: 'AI', render: (r: Record) => (
      r.aiConfidence != null ? <ConfidenceMeter score={r.aiConfidence} /> : <span className="text-[10px] text-slate-300">—</span>
    )},
    { key: 'status', label: 'Status', render: (r: Record) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r: Record) => (
      <div className="flex items-center gap-0.5 justify-end">
        <button
          onClick={() => navigate(`/records/${r.id}`)}
          className="p-1.5 text-slate-400 hover:text-navy-500 transition-colors"
          title="View"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        {canEdit && (
          <button
            onClick={() => navigate(`/records/${r.id}/edit`)}
            className="p-1.5 text-slate-400 hover:text-navy-500 transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
        {canClassify && (
          <button
            onClick={() => handleClassify(r.id)}
            className="p-1.5 text-slate-400 hover:text-pine-500 transition-colors"
            title="AI Classify"
          >
            <TagIcon className="w-4 h-4" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
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
          <ExportButton onExport={exportRecords} />
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

      {stats.totalRecords != null && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" data-testid="records-kpi-bar">
          <KpiCard
            label="Total Records"
            value={stats.totalRecords || 0}
            onClick={() => { setStatusFilter(''); }}
          />
          <KpiCard
            label="Pending Classification"
            value={stats.pendingClassification || 0}
            onClick={() => { setStatusFilter('active'); setSearch(''); }}
          />
          <KpiCard
            label="On Legal Hold"
            value={stats.onLegalHold || 0}
            onClick={() => { setStatusFilter('on_hold'); }}
          />
          <KpiCard
            label="Overdue Checkouts"
            value={stats.overdueCheckouts || 0}
            onClick={() => { setStatusFilter('checked_out'); }}
          />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex-1">
            <SearchInput placeholder="Search records..." onSearch={setSearch} />
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
              <option value="checked_out">Checked Out</option>
              <option value="in_transit">In Transit</option>
              <option value="on_hold">On Hold</option>
              <option value="pending_disposition">Pending Disposition</option>
              <option value="archived">Archived</option>
              <option value="transferred">Transferred</option>
              <option value="destroyed">Destroyed</option>
              <option value="disposed">Disposed</option>
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
          emptyState={
            search || statusFilter ? (
              <EmptyState
                title="No records match your filters"
                message="Try clearing your search or changing the status filter."
                action={<button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-sm text-navy-500 hover:underline">Clear all filters</button>}
              />
            ) : (
              <EmptyState
                icon={DocumentTextIcon}
                title="No records yet"
                message="Create your first record to get started with records management."
                action={<Link to="/records/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600"><PlusIcon className="w-4 h-4" />New Record</Link>}
              />
            )
          }
        />
      </div>
    </div>
  );
}