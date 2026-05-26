import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '../../components/StatusBadge';
import { WorkflowStatus } from '../../components/WorkflowStatus';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Transmittal } from '../../types';
import { format } from 'date-fns';

export function TransmittalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isStaff, isAdmin } = useAuth();
  const { data: transmittal, isLoading, refetch } = useApiQuery<Transmittal>(['transmittal', id!], `/transmittals/${id}`);

  const submitMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/submit`, 'post', {
    onSuccess: () => refetch(),
  });
  const receiveMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/receive`, 'post', {
    onSuccess: () => refetch(),
  });
  const approveMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/approve`, 'post', {
    onSuccess: () => refetch(),
  });
  const rejectMutation = useApiMutation<Transmittal, object>(`/transmittals/${id}/reject`, 'post', {
    onSuccess: () => refetch(),
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

  return (
    <div data-testid="transmittal-detail-page">
      <Link to="/transmittals" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to Transmittals
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Transmittal Detail</h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">{transmittal.trackingNumber}</p>
        </div>
        <StatusBadge status={transmittal.status} />
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-5 mb-6">
        <WorkflowStatus steps={steps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-md">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Items ({transmittal.items?.length ?? 0})</h2>
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
                    <td className="px-5 py-3 text-slate-700">{item.boxNumber || item.recordTrackingNumber || '—'}</td>
                    <td className="px-5 py-3 text-slate-700">{item.description || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{item.seriesTitle || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{item.dateRange || '—'}</td>
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
            </dl>
          </div>

          {transmittal.status !== 'approved' && transmittal.status !== 'rejected' && (
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-3">Actions</h3>
              <div className="space-y-2">
                {transmittal.status === 'draft' && (
                  <button
                    onClick={() => submitMutation.mutate({})}
                    disabled={submitMutation.isPending}
                    className="w-full h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
                    data-testid="submit-transmittal-button"
                  >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                  </button>
                )}
                {transmittal.status === 'submitted' && (isStaff || isAdmin) && (
                  <button
                    onClick={() => receiveMutation.mutate({})}
                    disabled={receiveMutation.isPending}
                    className="w-full h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
                    data-testid="receive-transmittal-button"
                  >
                    {receiveMutation.isPending ? 'Processing...' : 'Mark as Received'}
                  </button>
                )}
                {(transmittal.status === 'submitted' || transmittal.status === 'received') && (isStaff || isAdmin) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveMutation.mutate({})}
                      disabled={approveMutation.isPending}
                      className="flex-1 h-9 px-3 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      data-testid="approve-transmittal-button"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate({})}
                      disabled={rejectMutation.isPending}
                      className="flex-1 h-9 px-3 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                      data-testid="reject-transmittal-button"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}