import { useParams, Link } from 'react-router-dom';
import { PencilIcon, PrinterIcon, TagIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '../../components/StatusBadge';
import { WorkflowStatus } from '../../components/WorkflowStatus';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useApiQuery } from '../../hooks/useApi';
import { RMSRecord as Record, AuditEvent } from '../../types';
import { format } from 'date-fns';

export function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: recordResponse, isLoading } = useApiQuery<{ data: Record }>(['record', id!], `/records/${id}`);
  const { data: auditResponse } = useApiQuery<{ data: AuditEvent[] }>(['record-audit', id!], `/records/${id}/audit`);
  const record = recordResponse?.data;
  const auditHistory = auditResponse?.data ?? [];

  if (isLoading || !record) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  const workflowSteps = [
    { id: '1', label: 'Created', status: 'completed' as const },
    { id: '2', label: 'Classified', status: 'completed' as const },
    { id: '3', label: 'Stored', status: record.locationId ? 'completed' as const : 'current' as const },
    { id: '4', label: 'Retention', status: 'pending' as const },
    { id: '5', label: 'Disposition', status: 'pending' as const },
  ];

  return (
    <div data-testid="record-detail-page">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{record.trackingNumber}</span>
            <StatusBadge status={record.status} variant="small" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">{record.title}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            to={`/records/${id}/edit`}
            className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            data-testid="edit-record-button"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            data-testid="classify-record-button"
          >
            <TagIcon className="w-3.5 h-3.5" />
            Classify
          </button>
          <button
            className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            data-testid="print-label-button"
          >
            <PrinterIcon className="w-3.5 h-3.5" />
            Print Label
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-5 mb-6">
        <WorkflowStatus steps={workflowSteps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Series</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{record.seriesTitle}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Agency</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{record.agencyName}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Location</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{record.locationPath || <span className="text-slate-400 italic">Unassigned</span>}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Created</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{format(new Date(record.createdAt), 'MMM d, yyyy')}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-400 uppercase font-medium">Disposition Date</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{record.dispositionDate ? format(new Date(record.dispositionDate), 'MMM d, yyyy') : <span className="text-slate-400">N/A</span>}</dd>
              </div>
            </dl>
          </div>

          {record.description && (
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-2">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{record.description}</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Audit History</h2>
            {auditHistory.length === 0 ? (
              <p className="text-sm text-slate-400">No audit events recorded</p>
            ) : (
              <div className="space-y-2">
                {auditHistory.map((event) => (
                  <div key={event.id} className="flex items-baseline gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap tabular-nums">{format(new Date(event.timestamp), 'MMM d, HH:mm')}</span>
                    <span className="text-slate-700">{event.action}</span>
                    <span className="text-slate-400 text-xs">by {event.userName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {record.barcode && (
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Barcode</h3>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded text-center font-mono text-lg tracking-wider" data-testid="record-barcode">
                {record.barcode}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {(record.tags || []).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">{tag}</span>
              ))}
              {(!record.tags || record.tags.length === 0) && <p className="text-sm text-slate-400">No tags assigned</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}