import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TagIcon, TrashIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchInput } from '../../components/SearchInput';
import { ExportButton } from '../../components/ExportButton';
import { EmptyState } from '../../components/EmptyState';
import { KpiCard } from '../../components/KpiCard';
import { ConfidenceMeter } from '../../components/ConfidenceMeter';
import { FilterBar, ActiveFilter } from '../../components/FilterBar';
import { DropdownMenu, DropdownEntry } from '../../components/DropdownMenu';
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
  const [classifyingIds, setClassifyingIds] = useState<Set<string>>(new Set());
  const baselineConfidence = useRef<Map<string, number | null>>(new Map());
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  async function handleClassify(id: string, currentConfidence: number | null | undefined) {
    if (classifyingIds.has(id)) return;
    setClassifyingIds((prev) => new Set(prev).add(id));
    baselineConfidence.current.set(id, currentConfidence ?? null);
    toast('AI classification started — this usually takes 5-15 seconds.', 'info');
    try {
      await api.post(`/records/${id}/classify`);
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch {
      setClassifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      baselineConfidence.current.delete(id);
      toast('Classification failed. Try again or check the record.', 'error');
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ title: 'Delete Record', description: 'Are you sure you want to delete this record? This cannot be undone.', confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/records/${id}`);
      queryClient.invalidateQueries({ queryKey: ['records'] });
      toast('Record deleted.', 'success');
    } catch { toast('Delete failed.', 'error'); }
  }

  const { data: statsRaw } = useApiQuery<any>(['analytics-dashboard'], '/analytics/dashboard');
  const stats = statsRaw?.data ?? statsRaw ?? {};

  const { data, isLoading } = usePaginatedQuery<Record>(
    ['records'],
    '/records',
    { page, pageSize: 25, search, status: statusFilter || undefined }
  );

  // Poll while any record is classifying; clear from set when confidence changes.
  useEffect(() => {
    if (classifyingIds.size === 0) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [classifyingIds, queryClient]);

  useEffect(() => {
    if (classifyingIds.size === 0 || !data?.data) return;
    const completed: string[] = [];
    for (const id of classifyingIds) {
      const record = data.data.find((r) => r.id === id);
      if (!record) continue;
      const baseline = baselineConfidence.current.get(id);
      const current = record.aiConfidence ?? null;
      if (current !== baseline) completed.push(id);
    }
    if (completed.length > 0) {
      setClassifyingIds((prev) => {
        const next = new Set(prev);
        completed.forEach((id) => next.delete(id));
        return next;
      });
      completed.forEach((id) => baselineConfidence.current.delete(id));
      toast(`Classification complete (${completed.length} record${completed.length > 1 ? 's' : ''}).`, 'success');
    }
  }, [data, classifyingIds, toast]);

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
    { key: 'aiConfidence', label: 'AI', render: (r: Record) => {
      if (classifyingIds.has(r.id)) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-navy-600">
            <ArrowPathIcon className="w-3 h-3 animate-spin" />
            Classifying...
          </span>
        );
      }
      return r.aiConfidence != null
        ? <ConfidenceMeter score={r.aiConfidence} />
        : <span className="text-[10px] text-slate-300">—</span>;
    }},
    { key: 'status', label: 'Status', render: (r: Record) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r: Record) => {
      const items: DropdownEntry[] = [
        { key: 'view', label: 'View details', icon: <EyeIcon className="w-4 h-4 text-slate-400" />, onClick: () => navigate(`/records/${r.id}`) },
      ];
      if (canEdit) {
        items.push({ key: 'edit', label: 'Edit', icon: <PencilIcon className="w-4 h-4 text-slate-400" />, onClick: () => navigate(`/records/${r.id}/edit`) });
      }
      if (canClassify) {
        items.push({
          key: 'classify',
          label: classifyingIds.has(r.id) ? 'Classifying...' : 'AI Classify',
          icon: classifyingIds.has(r.id)
            ? <ArrowPathIcon className="w-4 h-4 text-navy-500 animate-spin" />
            : <TagIcon className="w-4 h-4 text-slate-400" />,
          disabled: classifyingIds.has(r.id),
          onClick: () => handleClassify(r.id, r.aiConfidence),
        });
      }
      if (canDelete) {
        items.push({ key: 'sep', separator: true });
        items.push({
          key: 'delete',
          label: 'Delete',
          icon: <TrashIcon className="w-4 h-4" />,
          danger: true,
          onClick: () => handleDelete(r.id),
        });
      }
      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/records/${r.id}`)}
            className="p-1.5 text-slate-400 hover:text-navy-500 transition-colors"
            title="View"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <DropdownMenu items={items} triggerLabel="Record actions" />
        </div>
      );
    }},
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

      {(() => {
        const active: ActiveFilter[] = [];
        if (search) active.push({ key: 'search', label: 'Search', value: search });
        if (statusFilter) active.push({ key: 'status', label: 'Status', value: statusFilter.replace(/_/g, ' ') });
        if (active.length === 0) return null;
        return (
          <FilterBar
            filters={active}
            onRemove={(key) => {
              if (key === 'search') setSearch('');
              if (key === 'status') setStatusFilter('');
            }}
            onClearAll={() => { setSearch(''); setStatusFilter(''); }}
            className="mb-3"
          />
        );
      })()}

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex-1">
            <SearchInput placeholder="Search records..." onSearch={setSearch} />
          </div>
          <div className="flex items-center gap-2">
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