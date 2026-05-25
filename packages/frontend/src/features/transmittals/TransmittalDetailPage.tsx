import { useParams } from 'react-router-dom';
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 font-mono">{transmittal.trackingNumber}</p>
          <h1 className="text-xl font-bold text-slate-800 mt-1">Transmittal Detail</h1>
        </div>
        <StatusBadge status={transmittal.status} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <WorkflowStatus steps={steps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Items ({transmittal.items.length})</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs text-slate-500 uppercase">Box #</th>
                  <th className="text-left py-2 text-xs text-slate-500 uppercase">Description</th>
                  <th className="text-left py-2 text-xs text-slate-500 uppercase">Series</th>
                  <th className="text-left py-2 text-xs text-slate-500 uppercase">Date Range</th>
                </tr>
              </thead>
              <tbody>
                {transmittal.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{item.boxNumber}</td>
                    <td className="py-2 text-slate-700">{item.description}</td>
                    <td className="py-2 text-slate-700">{item.seriesTitle}</td>
                    <td className="py-2 text-slate-700">{item.dateRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Agency</dt>
                <dd className="text-slate-700">{transmittal.agencyName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="text-slate-700">{transmittal.submittedAt ? format(new Date(transmittal.submittedAt), 'MMM d, yyyy') : '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Received</dt>
                <dd className="text-slate-700">{transmittal.receivedAt ? format(new Date(transmittal.receivedAt), 'MMM d, yyyy') : '-'}</dd>
              </div>
            </dl>
          </div>

          {(isStaff || isAdmin) && transmittal.status !== 'approved' && transmittal.status !== 'rejected' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Actions</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate({})}
                  disabled={approveMutation.isPending}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  data-testid="approve-transmittal-button"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectMutation.mutate({})}
                  disabled={rejectMutation.isPending}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  data-testid="reject-transmittal-button"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
