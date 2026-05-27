import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  PencilIcon, PrinterIcon, TagIcon, TrashIcon,
  DocumentIcon, ArrowLeftIcon, EllipsisVerticalIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../services/api';
import { RMSRecord as Record, AuditEvent } from '../../types';
import { format } from 'date-fns';

export function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { data: record, isLoading, isError, refetch } = useApiQuery<Record>(['record', id!], `/records/${id}`);
  const { data: auditHistory } = useApiQuery<AuditEvent[]>(['record-audit', id!], `/records/${id}/audit`);
  const { data: schedulesRaw } = useApiQuery<any>(['retention-schedules'], '/admin/retention-schedules');
  const schedules: any[] = schedulesRaw?.data ?? schedulesRaw ?? [];
  const classifyMutation = useApiMutation<unknown, void>(`/records/${id}/classify`, 'post', {
    onSuccess: () => {
      refetch();
      toast('Classification complete.', 'success');
    },
    onError: () => toast('Classification failed.', 'error'),
  });
  const deleteMutation = useApiMutation<unknown, void>(`/records/${id}`, 'delete', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      toast('Record deleted.', 'success');
      navigate('/records');
    },
    onError: () => toast('Delete failed.', 'error'),
  });

  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showDispositionMenu, setShowDispositionMenu] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // Compute processing state (safe even when record is null)
  const hasClassification = !!record?.seriesTitle;
  const isProcessing = !!record && record.hasDocument && !hasClassification && !classifyMutation.isPending;

  // Auto-poll while AI processing — must be before conditional returns
  useEffect(() => {
    if (isProcessing) {
      pollRef.current = setInterval(() => refetch(), 3000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isProcessing, refetch]);

  async function changeStatus(newStatus: string, confirmMsg?: string) {
    if (confirmMsg) {
      const ok = await confirm({ title: 'Confirm Status Change', description: confirmMsg, confirmLabel: 'Proceed', variant: 'danger' });
      if (!ok) return;
    }
    try {
      if (newStatus === 'in_transit' && record) {
        api.post('/transmittals', {
          title: `Transfer: ${record.title}`,
          agencyId: (record as any).agencyId,
          items: [{ recordId: record.id, boxNumber: (record as any).boxNumber || '', seriesTitle: record.seriesTitle || '' }],
        }).catch(() => {});
      }
      await api.put(`/records/${id}`, { status: newStatus });
      refetch();
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Status change failed.', 'error');
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Record Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">This record doesn't exist or may have been deleted.</p>
        <Link to="/records" className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 transition-colors">
          Back to Records
        </Link>
      </div>
    );
  }

  if (isLoading || !record) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  const hasLocation = !!(record.locationId || (record.locationPath && record.locationPath !== 'Unassigned'));
  const hasRetention = !!(record.retentionScheduleId || (record as any).retentionScheduleId);
  const isDisposed = ['disposed', 'destroyed', 'transferred', 'archived'].includes(record.status);
  const isReadOnly = isDisposed || isProcessing;

  // Each later step implies all prior steps are complete
  const dispositionDone = isDisposed || record.status === 'pending_disposition';
  const retentionDone = hasRetention || dispositionDone;
  const storedDone = hasLocation || retentionDone;
  const classifiedDone = hasClassification || storedDone;

  const lifecycleSteps = [
    { label: 'Created', done: true },
    { label: 'Classified', done: classifiedDone },
    { label: 'Stored', done: storedDone },
    { label: 'Retention', done: retentionDone },
    { label: 'Disposition', done: dispositionDone },
  ];

  // Determine next lifecycle action needed
  const nextAction = !classifiedDone ? 'classify' : !storedDone ? 'store' : !retentionDone ? 'retention' : null;

  return (
    <div data-testid="record-detail-page" className="relative">
      {/* Classification overlay */}
      {classifyMutation.isPending && (
        <div className="absolute inset-0 bg-white/80 z-30 flex items-center justify-center rounded-md">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-navy-600">AI is classifying this record...</p>
            <p className="text-xs text-slate-400">Analyzing content and assigning series</p>
          </div>
        </div>
      )}

      {/* AI Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 z-30 flex items-center justify-center rounded-md">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-navy-600">AI is processing this document...</p>
            <p className="text-xs text-slate-400">Extracting text and classifying. This will update automatically.</p>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Records', to: '/records' },
          { label: record.trackingNumber || record.title },
        ]}
        className="mb-3"
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Link to="/records" className="mt-1.5 text-slate-400 hover:text-navy-600 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{record.title}</h1>
              {/* Status dropdown */}
              {!isReadOnly && record.status === 'active' ? (
                <select
                  value={record.status}
                  onChange={(e) => { if (e.target.value !== record.status) changeStatus(e.target.value); }}
                  className="h-6 px-2 text-[11px] font-medium rounded-full bg-green-100 text-green-800 border-0 focus:outline-none focus:ring-2 focus:ring-navy-500 cursor-pointer appearance-none pr-5"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23166534'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '14px' }}
                >
                  <option value="active">Active</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="in_transit">In Transit</option>
                  <option value="on_hold">Legal Hold</option>
                </select>
              ) : !isReadOnly && (record.status === 'checked_out' || record.status === 'in_transit' || record.status === 'on_hold') ? (
                <select
                  value={record.status}
                  onChange={(e) => { if (e.target.value !== record.status) changeStatus(e.target.value); }}
                  className="h-6 px-2 text-[11px] font-medium rounded-full bg-slate-100 text-slate-700 border-0 focus:outline-none focus:ring-2 focus:ring-navy-500 cursor-pointer appearance-none pr-5"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23475569'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '14px' }}
                >
                  <option value="active">Active</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="in_transit">In Transit</option>
                  <option value="on_hold">Legal Hold</option>
                </select>
              ) : (
                <StatusBadge status={record.status} variant="small" />
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="font-mono">{record.trackingNumber}</span>
              {record.seriesTitle && <> · {record.seriesTitle}</>}
              {record.agencyName && <> · {record.agencyName}</>}
            </p>
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-1.5">
            <Link
              to={`/records/${id}/edit`}
              className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              data-testid="edit-record-button"
            >
              <PencilIcon className="w-3.5 h-3.5" />
              Edit
            </Link>
            {hasRetention && record.status === 'active' && (
              <div className="relative">
                <button
                  onClick={() => setShowDispositionMenu((v) => !v)}
                  className="flex items-center gap-1.5 h-8 px-3 border border-red-200 rounded text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Dispositions
                </button>
                {showDispositionMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 py-1 w-56">
                    {([
                      { action: 'destroy', label: 'Destroy', desc: 'Permanently delete records' },
                      { action: 'transfer', label: 'Transfer', desc: 'Send to another agency' },
                      { action: 'archive', label: 'Archive', desc: 'Move to permanent storage' },
                    ] as const).map(({ action, label, desc }) => (
                      <button
                        key={action}
                        onClick={async () => {
                          setShowDispositionMenu(false);
                          try {
                            await api.post('/dispositions', {
                              title: `Disposition: ${record.title}`,
                              dispositionAction: action,
                              recordIds: [record.id],
                            });
                            await api.put(`/records/${id}`, { status: 'pending_disposition' });
                            refetch();
                          } catch (err: any) {
                            toast(err?.response?.data?.error || 'Failed to initiate disposition', 'error');
                          }
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="block text-xs text-slate-400">{desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {record.status === 'pending_disposition' && (
              <>
                <button
                  onClick={() => changeStatus('disposed', 'Mark as disposed? This is permanent and cannot be undone.')}
                  className="flex items-center gap-1.5 h-8 px-3 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Complete Disposition
                </button>
                <button
                  onClick={() => changeStatus('active')}
                  className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="flex items-center justify-center w-8 h-8 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
              {showMoreActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoreActions(false)} />
                  <div className="absolute right-0 top-9 z-20 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1">
                    <button
                      onClick={async () => {
                        setShowMoreActions(false);
                        try {
                          const res = await api.get(`/records/${id}/label`, { responseType: 'text', transformResponse: [(d: string) => d] });
                          const win = window.open('', '_blank');
                          if (win) { win.document.write(res.data); win.document.close(); }
                        } catch { /* */ }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      data-testid="print-label-button"
                    >
                      <PrinterIcon className="w-4 h-4 text-slate-400" />
                      Print Label
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={async () => {
                        setShowMoreActions(false);
                        const ok = await confirm({ title: 'Delete Record', description: 'Delete this record? This cannot be undone.', confirmLabel: 'Delete', variant: 'danger' });
                        if (ok) deleteMutation.mutate(undefined as unknown as void);
                      }}
                      disabled={deleteMutation.isPending}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      data-testid="delete-record-button"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lifecycle Progress */}
      <div className="bg-white border border-slate-200 rounded-md p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Record Lifecycle</h2>
          {isDisposed && <span className="text-xs font-medium text-red-500">Disposed — Read Only</span>}
        </div>

        {/* Steps */}
        <nav aria-label="Record lifecycle" data-testid="workflow-status">
          <ol className="flex items-center justify-between">
            {lifecycleSteps.map((step, i) => (
              <li key={step.label} className={`flex items-center ${i < lifecycleSteps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-2">
                  {step.done ? (
                    <span className="w-6 h-6 rounded-full bg-pine-500 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3.5 h-3.5 text-white" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    </span>
                  )}
                  <span className={`text-xs font-medium whitespace-nowrap ${step.done ? 'text-pine-700' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < lifecycleSteps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${step.done ? 'bg-pine-300' : 'bg-slate-200'}`} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Next Step Guidance */}
        {!isReadOnly && nextAction && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <ArrowRightIcon className="w-4 h-4 text-navy-500 flex-shrink-0" />
              {nextAction === 'classify' && (
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-slate-600">Next: Classify this record to assign a series</span>
                  <button
                    onClick={() => {
                      toast('AI classification started — this usually takes 5-15 seconds.', 'info');
                      classifyMutation.mutate(undefined as unknown as void);
                    }}
                    disabled={classifyMutation.isPending}
                    className="h-7 px-3 text-xs font-medium bg-navy-500 text-white rounded hover:bg-navy-600 transition-colors disabled:opacity-50"
                    data-testid="classify-record-button"
                  >
                    <TagIcon className="w-3.5 h-3.5 inline mr-1" />
                    {classifyMutation.isPending ? 'Classifying...' : 'AI Classify'}
                  </button>
                </div>
              )}
              {nextAction === 'store' && (
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-slate-600">Next: Assign a physical storage location</span>
                  <Link
                    to={`/records/${id}/edit`}
                    className="h-7 px-3 text-xs font-medium bg-navy-500 text-white rounded hover:bg-navy-600 transition-colors inline-flex items-center"
                  >
                    Assign Location
                  </Link>
                </div>
              )}
              {nextAction === 'retention' && (
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-slate-600">Next: Assign a retention schedule</span>
                  <select
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      try {
                        await api.patch(`/records/${id}/retention`, { schedule_id: e.target.value });
                        refetch();
                      } catch { toast('Failed to assign retention.', 'error'); }
                    }}
                    className="h-7 px-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white text-slate-600"
                    defaultValue=""
                  >
                    <option value="">Select schedule...</option>
                    {schedules.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.code || s.name} ({s.retentionYears || s.retention_years}yr)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Details card */}
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Location</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{record.locationPath || <span className="text-slate-400 italic">Not assigned</span>}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Retention</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{hasRetention ? <span className="text-pine-700 font-medium">Assigned</span> : <span className="text-slate-400 italic">Not assigned</span>}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Created</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{format(new Date(record.createdAt), 'MMM d, yyyy')}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Disposition Date</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{record.dispositionDate ? format(new Date(record.dispositionDate), 'MMM d, yyyy') : <span className="text-slate-400">—</span>}</dd>
              </div>
              {record.barcode && (
                <div>
                  <dt className="text-[11px] text-slate-400 uppercase font-medium">Barcode</dt>
                  <dd className="mt-0.5 text-sm text-slate-700 font-mono">{record.barcode}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Description */}
          {record.description && (
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{record.description}</p>
            </div>
          )}

          {/* Audit Trail */}
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Audit Trail</h2>
            {(!auditHistory || auditHistory.length === 0) ? (
              <p className="text-sm text-slate-400 italic">No events recorded</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {auditHistory.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-2 text-sm">
                    <span className="text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">{format(new Date(event.createdAt), 'MMM d, HH:mm')}</span>
                    <span className="text-slate-700">{event.action}</span>
                    <span className="text-xs text-slate-400 ml-auto">{event.userEmail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Document */}
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Document</h3>
            {record.hasDocument ? (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded">
                <DocumentIcon className="w-5 h-5 text-navy-500 flex-shrink-0" />
                <span className="text-sm text-slate-700 font-medium truncate flex-1">{record.documentKey?.split('/').pop() || 'Attached document'}</span>
                <button
                  onClick={async () => {
                    try {
                      const { data } = await api.get(`/records/${id}/download`);
                      const url = data.downloadUrl || data.data?.downloadUrl;
                      if (url) window.open(url, '_blank');
                    } catch { toast('Failed to get download link', 'error'); }
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-navy-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                >
                  Open
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No document attached</p>
            )}
          </div>

          {/* Tags */}
          {record.tags && record.tags.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {record.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}