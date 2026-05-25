import { useParams } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Disposition } from '../../types';
import { format } from 'date-fns';

export function DispositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isStaff, isAdmin } = useAuth();
  const { data: disposition, isLoading, refetch } = useApiQuery<Disposition>(['disposition', id!], `/dispositions/${id}`);

  const approveMutation = useApiMutation<Disposition, object>(`/dispositions/${id}/approve`, 'post', {
    onSuccess: () => refetch(),
  });
  const rejectMutation = useApiMutation<Disposition, { reason: string }>(`/dispositions/${id}/reject`, 'post', {
    onSuccess: () => refetch(),
  });

  if (isLoading || !disposition) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div data-testid="disposition-detail-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{disposition.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {disposition.method.charAt(0).toUpperCase() + disposition.method.slice(1)} — Scheduled {format(new Date(disposition.scheduledDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {disposition.legalHold && (
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 border border-orange-200 rounded-md" data-testid="legal-hold-indicator">
              <ShieldExclamationIcon className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Legal Hold Active</span>
            </div>
          )}
          <StatusBadge status={disposition.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Records ({disposition.recordCount})</h2>
            <p className="text-sm text-slate-500">
              {disposition.recordCount} records from {disposition.agencyName} scheduled for {disposition.method}.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Approval Chain</h2>
            <div className="space-y-3">
              {disposition.approvalChain.map((step) => (
                <div key={step.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{step.userName}</p>
                    <p className="text-xs text-slate-500">{step.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={step.status} variant="small" />
                    {step.decidedAt && (
                      <span className="text-xs text-slate-400">{format(new Date(step.decidedAt), 'MMM d')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {(isStaff || isAdmin) && disposition.status === 'pending' && !disposition.legalHold && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => approveMutation.mutate({})}
                  disabled={approveMutation.isPending}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  data-testid="approve-disposition-button"
                >
                  Approve Disposition
                </button>
                <button
                  onClick={() => rejectMutation.mutate({ reason: '' })}
                  disabled={rejectMutation.isPending}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  data-testid="reject-disposition-button"
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
