import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '../../components/StatusBadge';
import { WorkflowStatus } from '../../components/WorkflowStatus';
import { Timeline, TimelineEvent } from '../../components/Timeline';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { useToast } from '../../components/Toast';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Transmittal } from '../../types';
import { format } from 'date-fns';

function buildTimeline(t: Transmittal): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  events.push({
    id: 'created',
    label: 'Transmittal created',
    actor: t.submittedByName || undefined,
    timestamp: t.createdAt ? format(new Date(t.createdAt), 'MMM d, yyyy h:mm a') : undefined,
    details: `${t.itemCount ?? (t.items?.length || 0)} boxes prepared for transfer`,
    variant: 'default',
  });

  if (t.submittedAt) {
    events.push({
      id: 'submitted',
      label: 'Submitted to State Archives',
      actor: t.submittedByName || undefined,
      timestamp: format(new Date(t.submittedAt), 'MMM d, yyyy h:mm a'),
      details: 'Awaiting review by Archives staff',
      variant: 'success',
    });
  }

  if (t.receivedAt) {
    events.push({
      id: 'received',
      label: 'Received by Archives',
      actor: t.receivedByName || undefined,
      timestamp: format(new Date(t.receivedAt), 'MMM d, yyyy h:mm a'),
      details: 'Physical boxes verified and inventoried',
      variant: 'success',
    });
  }

  if (t.approvedAt) {
    events.push({
      id: 'approved',
      label: 'Transfer approved',
      actor: t.approvedByName || undefined,
      timestamp: format(new Date(t.approvedAt), 'MMM d, yyyy h:mm a'),
      details: 'Records accessioned into Archives custody',
      variant: 'success',
    });
  }

  if (t.status === 'rejected') {
    events.push({
      id: 'rejected',
      label: 'Transfer rejected',
      actor: t.approvedByName || undefined,
      timestamp: t.approvedAt ? format(new Date(t.approvedAt), 'MMM d, yyyy h:mm a') : undefined,
      details: t.rejectionReason || 'Returned to sender for corrections',
      variant: 'danger',
    });
  }

  return events;
}

export function TransmittalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isStaff, isAdmin } = useAuth();
  const isArchivesStaff = isStaff || isAdmin;
  const { toast } = useToast();
  const { data: transmittal, isLoading, refetch } = useApiQuery<Transmittal>(['transmittal', id!], `/transmittals/${id}`);

  const submitMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/submit`, 'post', {
    onSuccess: () => { refetch(); toast('Transmittal submitted for review.', 'success'); },
    onError: () => toast('Submit failed.', 'error'),
  });
  const receiveMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/receive`, 'post', {
    onSuccess: () => { refetch(); toast('Receipt confirmed.', 'success'); },
    onError: () => toast('Receive failed.', 'error'),
  });
  const approveMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/approve`, 'post', {
    onSuccess: () => { refetch(); toast('Transmittal approved.', 'success'); },
    onError: () => toast('Approve failed.', 'error'),
  });
  const rejectMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/reject`, 'post', {
    onSuccess: () => { refetch(); toast('Transmittal rejected.', 'success'); },
    onError: () => toast('Reject failed.', 'error'),
  });

  if (isLoading || !transmittal) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  const steps = [
    { id: '1', label: 'Draft', status: 'completed' as const },
    { id: '2', label: 'Submitted', status: transmittal.status === 'draft' ? 'current' as const : 'completed' as const },
    { id: '3', label: 'Received', status: transmittal.status === 'submitted' ? 'current' as const : transmittal.receivedAt ? 'completed' as const : 'pending' as const },
    { id: '4', label: 'Approved', status: transmittal.status === 'received' ? 'current' as const : transmittal.status === 'approved' ? 'completed' as const : 'pending' as const },
  ];

  const timeline = buildTimeline(transmittal);

  return (
    <div data-testid="transmittal-detail-page">
      <Breadcrumbs
        items={[
          { label: 'Transmittals', to: '/transmittals' },
          { label: transmittal.trackingNumber || transmittal.title || 'Detail' },
        ]}
        className="mb-3"
      />
      <Link to="/transmittals" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to Transmittals
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{transmittal.title || 'Transmittal Detail'}</h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">{transmittal.trackingNumber}</p>
        </div>
        <StatusBadge status={transmittal.status} />
      </div>

      {transmittal.status === 'rejected' && transmittal.rejectionReason && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-md p-4 mb-6" data-testid="rejection-banner">
          <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Transfer Rejected</p>
            <p className="text-sm text-red-700 mt-0.5">{transmittal.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md p-5 mb-6">
        <WorkflowStatus steps={steps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer Summary */}
          <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="transfer-summary">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Transfer Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">From (Sender)</p>
                <p className="text-sm font-medium text-slate-800">{transmittal.agencyName || '—'}</p>
                <p className="text-xs text-slate-500">{transmittal.submittedByName || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">To (Destination)</p>
                <p className="text-sm font-medium text-slate-800">Maine State Archives</p>
                <p className="text-xs text-slate-500">
                  {transmittal.receivedByName ? `Received by: ${transmittal.receivedByName}` : 'Awaiting receipt'}
                </p>
              </div>
            </div>
            {transmittal.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">Notes</p>
                <p className="text-sm text-slate-600">{transmittal.description}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white border border-slate-200 rounded-md">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Items ({transmittal.items?.length ?? 0} boxes)
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Box #</th>
                  <th className="text-left px-5 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Description</th>
                  <th className="text-left px-5 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Series</th>
                  <th className="text-left px-5 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Date Range</th>
                </tr>
              </thead>
              <tbody>
                {(transmittal.items || []).map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-slate-700 font-mono">{item.boxNumber || item.box_number || item.recordTrackingNumber || '—'}</td>
                    <td className="px-5 py-3 text-slate-700">{item.description || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{item.seriesTitle || item.series_title || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{item.dateRange || item.date_range || '—'}</td>
                  </tr>
                ))}
                {(!transmittal.items || transmittal.items.length === 0) && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">No items</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Details sidebar */}
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Agency</dt>
                <dd className="text-slate-700">{transmittal.agencyName || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="text-slate-700">{transmittal.submittedAt ? format(new Date(transmittal.submittedAt), 'MMM d, yyyy') : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Received</dt>
                <dd className="text-slate-700">{transmittal.receivedAt ? format(new Date(transmittal.receivedAt), 'MMM d, yyyy') : '—'}</dd>
              </div>
              {transmittal.approvedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Approved</dt>
                  <dd className="text-slate-700">{format(new Date(transmittal.approvedAt), 'MMM d, yyyy')}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          {transmittal.status !== 'approved' && transmittal.status !== 'rejected' && (
            <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="actions-panel">
              <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-3">Actions</h3>
              <div className="space-y-2">
                {transmittal.status === 'draft' && (
                  <>
                    <p className="text-xs text-slate-500 mb-2">Submit this transmittal to Maine State Archives for review and physical receipt.</p>
                    <button
                      onClick={() => submitMutation.mutate({})}
                      disabled={submitMutation.isPending}
                      className="w-full h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
                      data-testid="submit-transmittal-button"
                    >
                      {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </>
                )}
                {transmittal.status === 'submitted' && isArchivesStaff && (
                  <>
                    <p className="text-xs text-slate-500 mb-2">Confirm physical receipt of boxes from {transmittal.agencyName}. This verifies the shipment arrived.</p>
                    <button
                      onClick={() => receiveMutation.mutate({})}
                      disabled={receiveMutation.isPending}
                      className="w-full h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
                      data-testid="receive-transmittal-button"
                    >
                      {receiveMutation.isPending ? 'Processing...' : 'Confirm Receipt'}
                    </button>
                  </>
                )}
                {(transmittal.status === 'submitted' || transmittal.status === 'received') && isArchivesStaff && (
                  <>
                    <p className="text-xs text-slate-500 mb-2 mt-3">
                      {transmittal.status === 'received'
                        ? 'Approve to accession records into Archives custody. Records will become active.'
                        : 'Approve or reject the transfer request.'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMutation.mutate({})}
                        disabled={approveMutation.isPending}
                        className="flex-1 h-9 px-3 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                        data-testid="approve-transmittal-button"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate({})}
                        disabled={rejectMutation.isPending}
                        className="flex-1 h-9 px-3 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                        data-testid="reject-transmittal-button"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="transmittal-timeline">
            <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-3">Activity</h3>
            <Timeline events={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
