import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldExclamationIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../services/api';
import { Disposition } from '../../types';
import { format } from 'date-fns';

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  destroy: { label: 'Destroy', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  transfer: { label: 'Transfer', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  archive: { label: 'Archive', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
};

export function DispositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff, isAdmin } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { data: disposition, isLoading, refetch } = useApiQuery<Disposition>(['disposition', id!], `/dispositions/${id}`);

  const approveMutation = useApiMutation<Disposition, object>(`/dispositions/${id}/approve`, 'post', {
    onSuccess: () => { refetch(); toast('Approval recorded.', 'success'); },
    onError: () => toast('Approve failed.', 'error'),
  });
  const rejectMutation = useApiMutation<Disposition, { reason: string }>(`/dispositions/${id}/reject`, 'post', {
    onSuccess: () => { refetch(); toast('Disposition rejected.', 'success'); },
    onError: () => toast('Reject failed.', 'error'),
  });

  if (isLoading || !disposition) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  const d = disposition as any;
  const actionKey = d.dispositionAction || disposition.method || 'destroy';
  const actionCfg = ACTION_CONFIG[actionKey] || ACTION_CONFIG.destroy;
  const items = d.items || [];

  // Determine approval progress
  const approvalLevel = d.firstApproverId ? (d.secondApproverId ? (d.thirdApproverId ? 3 : 2) : 1) : 0;
  const isApproved = disposition.status === 'approved';
  const isRejected = disposition.status === 'rejected';
  const isPending = disposition.status === 'pending' || disposition.status === 'pending_approval';

  return (
    <div data-testid="disposition-detail-page">
      <Breadcrumbs
        items={[
          { label: 'Dispositions', to: '/dispositions' },
          { label: disposition.title || 'Detail' },
        ]}
        className="mb-3"
      />
      {/* Back navigation */}
      <Link to="/dispositions" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to Dispositions
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-slate-800">{disposition.title}</h1>
              <StatusBadge status={disposition.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${actionCfg.bg} ${actionCfg.color}`}>
                {actionCfg.label}
              </span>
              {d.initiatedAt && (
                <span>Initiated {format(new Date(d.initiatedAt), 'MMM d, yyyy')}</span>
              )}
              {d.agencyName && (
                <span>{d.agencyName}</span>
              )}
            </div>
            {d.description && (
              <p className="text-sm text-slate-600 mt-3">{d.description}</p>
            )}
          </div>

          {d.legalHold && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-md" data-testid="legal-hold-indicator">
              <ShieldExclamationIcon className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Legal Hold</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Records table */}
          <div className="bg-white border border-slate-200 rounded-md">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-800">Records ({items.length})</h2>
              </div>
              <span className="text-xs text-slate-400">
                Scheduled for {actionCfg.label.toLowerCase()}
              </span>
            </div>
            {items.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Tracking #</th>
                    <th className="text-left px-5 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Title</th>
                    <th className="text-left px-5 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Series</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono text-xs text-navy-500">{item.recordTrackingNumber || '—'}</td>
                      <td className="px-5 py-3 text-slate-700 font-medium">{item.recordTitle || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{item.recordSeriesTitle || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-400">No records attached</div>
            )}
          </div>

          {/* Approval Chain */}
          <div className="bg-white border border-slate-200 rounded-md">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Approval Chain</h2>
              <p className="text-xs text-slate-400 mt-0.5">Three-level approval required for disposition</p>
            </div>
            <div className="p-5">
              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-[15px] top-[20px] bottom-[20px] w-px bg-slate-200" />

                {[
                  { level: 1, title: 'Records Officer', desc: 'Initial review and verification' },
                  { level: 2, title: 'Archives Staff', desc: 'Secondary review and compliance check' },
                  { level: 3, title: 'System Administrator', desc: 'Final authorization' },
                ].map(({ level, title, desc }) => {
                  const done = approvalLevel >= level;
                  const current = approvalLevel === level - 1 && isPending;
                  return (
                    <div key={level} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      <div className={`relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 ${
                        done ? 'bg-green-50 border-green-500' :
                        isRejected && current ? 'bg-red-50 border-red-400' :
                        current ? 'bg-navy-50 border-navy-500' :
                        'bg-white border-slate-200'
                      }`}>
                        {done ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : isRejected && level === approvalLevel + 1 ? (
                          <XCircleIcon className="w-4 h-4 text-red-500" />
                        ) : current ? (
                          <ClockIcon className="w-3.5 h-3.5 text-navy-500" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300">{level}</span>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${done ? 'text-slate-800' : current ? 'text-slate-700' : 'text-slate-400'}`}>
                              Level {level} — {title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                          </div>
                          {done && (
                            <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Approved</span>
                          )}
                          {isRejected && level === approvalLevel + 1 && (
                            <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">Rejected</span>
                          )}
                          {current && (
                            <span className="text-[11px] font-medium text-navy-600 bg-navy-50 px-2 py-0.5 rounded">Awaiting</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Certificate (shown when fully approved) */}
          {isApproved && d.certificateNumber && (
            <div className="bg-green-50 border border-green-200 rounded-md p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-green-800">Disposition Approved</h3>
              </div>
              <p className="text-sm text-green-700">
                Certificate Number: <span className="font-mono font-medium">{d.certificateNumber}</span>
              </p>
              {d.completedAt && (
                <p className="text-xs text-green-600 mt-1">
                  Completed on {format(new Date(d.completedAt), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details card */}
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd><StatusBadge status={disposition.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Action</dt>
                <dd className={`font-medium capitalize ${actionCfg.color}`}>{actionCfg.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Records</dt>
                <dd className="text-slate-700 font-medium">{items.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Approval</dt>
                <dd className="text-slate-700 font-medium">{approvalLevel}/3</dd>
              </div>
              {d.initiatedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Initiated</dt>
                  <dd className="text-slate-700">{format(new Date(d.initiatedAt), 'MMM d, yyyy')}</dd>
                </div>
              )}
              {d.completedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Completed</dt>
                  <dd className="text-slate-700">{format(new Date(d.completedAt), 'MMM d, yyyy')}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions card */}
          {(isStaff || isAdmin) && isPending && !d.legalHold && (
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const level = !d.firstApproverId ? 'first' : !d.secondApproverId ? 'second' : 'third';
                    approveMutation.mutate({ level } as any);
                  }}
                  disabled={approveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 h-9 px-3 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  data-testid="approve-disposition-button"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  {!d.firstApproverId ? 'Approve (Level 1)' : !d.secondApproverId ? 'Approve (Level 2)' : 'Final Approval'}
                </button>
                <button
                  onClick={() => rejectMutation.mutate({ reason: '' })}
                  disabled={rejectMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 h-9 px-3 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                  data-testid="reject-disposition-button"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-3">Danger Zone</h3>
            <button
              onClick={async () => {
                const ok = await confirm({ title: 'Delete Disposition', description: 'Delete this disposition? Records will be returned to active status.', confirmLabel: 'Delete', variant: 'danger' });
                if (!ok) return;
                try {
                  await api.delete(`/dispositions/${id}`);
                  navigate('/dispositions');
                } catch (err: any) {
                  toast(err?.response?.data?.error || 'Failed to delete disposition', 'error');
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 h-9 px-3 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors"
              data-testid="delete-disposition-button"
            >
              <TrashIcon className="w-4 h-4" />
              Delete Disposition
            </button>
            <p className="text-[11px] text-slate-400 mt-2">Records will return to active status</p>
          </div>
        </div>
      </div>
    </div>
  );
}