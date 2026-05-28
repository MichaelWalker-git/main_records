import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TagIcon, TrashIcon, EyeIcon, DocumentTextIcon, ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<null | 'classify' | 'dispose'>(null);
  const baselineConfidence = useRef<Map<string, number | null>>(new Map());
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const CLASSIFY_TIMEOUT_MS = 30_000;

  function clearClassifyingId(id: string) {
    setClassifyingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    baselineConfidence.current.delete(id);
    const t = timeoutRefs.current.get(id);
    if (t) {
      clearTimeout(t);
      timeoutRefs.current.delete(id);
    }
  }

  async function handleClassify(id: string, currentConfidence: number | null | undefined) {
    if (classifyingIds.has(id)) return;
    setClassifyingIds((prev) => new Set(prev).add(id));
    baselineConfidence.current.set(id, currentConfidence ?? null);
    toast('AI classification started — this usually takes 5-15 seconds.', 'info');

    // Safety net: if confidence never changes (failure that still invalidates the
    // query, identical confidence, or unreachable backend) the spinner would hang.
    const timer = setTimeout(() => {
      if (timeoutRefs.current.get(id) === timer) {
        clearClassifyingId(id);
        toast('Classification is taking longer than expected. Refresh later to see the result.', 'warning');
      }
    }, CLASSIFY_TIMEOUT_MS);
    timeoutRefs.current.set(id, timer);

    try {
      await api.post(`/records/${id}/classify`);
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch {
      clearClassifyingId(id);
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

  // Poll while any record is classifying.
  useEffect(() => {
    if (classifyingIds.size === 0) return;
    pollRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [classifyingIds, queryClient]);

  // Detect completion when a polled response shows confidence has changed.
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
      completed.forEach(clearClassifyingId);
      toast(`Classification complete (${completed.length} record${completed.length > 1 ? 's' : ''}).`, 'success');
    }
  }, [data, classifyingIds, toast]);

  // Clean up any pending timeout timers on unmount.
  useEffect(() => {
    const timers = timeoutRefs.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const visibleIds = (data?.data ?? []).map((r) => r.id);
  const allSelectedOnPage = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelectedOnPage = visibleIds.some((id) => selectedIds.has(id));

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePageSelection() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function handleBulkClassify() {
    if (selectedIds.size === 0) return;
    setBulkBusy('classify');
    const ids = Array.from(selectedIds);
    let ok = 0, failed = 0;
    for (const id of ids) {
      try { await api.post(`/records/${id}/classify`); ok++; }
      catch { failed++; }
    }
    setBulkBusy(null);
    setSelectedIds(new Set());
    queryClient.invalidateQueries({ queryKey: ['records'] });
    toast(`Bulk classify: ${ok} queued${failed ? `, ${failed} failed` : ''}.`, failed ? 'warning' : 'success');
  }

  async function handleBulkDispose() {
    if (selectedIds.size === 0) return;
    const ok = await confirm({
      title: 'Bulk Dispose',
      description: `Create a disposition workflow for ${selectedIds.size} record(s)?`,
      confirmLabel: 'Create disposition',
      variant: 'danger',
    });
    if (!ok) return;
    setBulkBusy('dispose');
    try {
      await api.post('/dispositions', {
        title: `Bulk disposition (${selectedIds.size} records)`,
        dispositionAction: 'destroy',
        recordIds: Array.from(selectedIds),
      });
      toast(`Disposition created for ${selectedIds.size} records.`, 'success');
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Bulk dispose failed.', 'error');
    } finally {
      setBulkBusy(null);
    }
  }

  const columns = [
    {
      key: 'select',
      label: '',
      render: (r: Record) => (
        <input
          type="checkbox"
          aria-label={`Select ${r.title}`}
          checked={selectedIds.has(r.id)}
          onChange={() => toggleRow(r.id)}
          className="h-4 w-4 rounded border-slate-300 text-navy-500 focus:ring-navy-500"
          data-testid={`row-select-${r.id}`}
        />
      ),
    },
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
            to="/records/import"
            className="flex items-center gap-1.5 h-9 px-3 border border-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors"
            data-testid="import-csv-button"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import CSV
          </Link>
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

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-navy-50 border border-navy-200 rounded-md px-3 py-2 mb-3" data-testid="bulk-action-bar">
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy-700 font-medium">{selectedIds.size} selected</span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-navy-600 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            {canClassify && (
              <button
                onClick={handleBulkClassify}
                disabled={bulkBusy !== null}
                className="h-8 px-3 text-xs font-medium border border-navy-300 text-navy-700 bg-white rounded hover:bg-navy-100 disabled:opacity-50"
                data-testid="bulk-classify-button"
              >
                {bulkBusy === 'classify' ? 'Classifying...' : 'Bulk AI Classify'}
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleBulkDispose}
                disabled={bulkBusy !== null}
                className="h-8 px-3 text-xs font-medium border border-red-200 text-red-700 bg-white rounded hover:bg-red-50 disabled:opacity-50"
                data-testid="bulk-dispose-button"
              >
                {bulkBusy === 'dispose' ? 'Working...' : 'Bulk Dispose'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <label className="inline-flex items-center gap-2 text-xs text-slate-500" title="Select all on page">
            <input
              type="checkbox"
              aria-label="Select all on page"
              checked={allSelectedOnPage}
              ref={(el) => { if (el) el.indeterminate = !allSelectedOnPage && someSelectedOnPage; }}
              onChange={togglePageSelection}
              className="h-4 w-4 rounded border-slate-300 text-navy-500 focus:ring-navy-500"
              data-testid="select-all-page"
            />
            <span>Select all</span>
          </label>
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