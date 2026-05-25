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
  const { data: record, isLoading } = useApiQuery<Record>(['record', id!], `/records/${id}`);
  const { data: auditHistory = [] } = useApiQuery<AuditEvent[]>(['record-audit', id!], `/records/${id}/audit`);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 font-mono">{record.trackingNumber}</p>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">{record.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/records/${id}/edit`}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
            data-testid="edit-record-button"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Link>
          <button
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
            data-testid="classify-record-button"
          >
            <TagIcon className="w-4 h-4" />
            Classify
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
            data-testid="print-label-button"
          >
            <PrinterIcon className="w-4 h-4" />
            Print Label
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <WorkflowStatus steps={workflowSteps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-slate-500 uppercase">Status</dt>
                <dd className="mt-1"><StatusBadge status={record.status} /></dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase">Series</dt>
                <dd className="mt-1 text-sm text-slate-700">{record.seriesTitle}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase">Agency</dt>
                <dd className="mt-1 text-sm text-slate-700">{record.agencyName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase">Location</dt>
                <dd className="mt-1 text-sm text-slate-700">{record.locationPath || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase">Created</dt>
                <dd className="mt-1 text-sm text-slate-700">{format(new Date(record.createdAt), 'MMM d, yyyy')}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase">Disposition Date</dt>
                <dd className="mt-1 text-sm text-slate-700">{record.dispositionDate ? format(new Date(record.dispositionDate), 'MMM d, yyyy') : 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {record.description && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Description</h2>
              <p className="text-sm text-slate-700">{record.description}</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Audit History</h2>
            <div className="space-y-3">
              {auditHistory.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-slate-400 whitespace-nowrap">{format(new Date(event.timestamp), 'MMM d, HH:mm')}</span>
                  <span className="text-slate-700">{event.action}</span>
                  <span className="text-slate-500">by {event.userName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {record.barcode && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Barcode</h3>
              <div className="bg-slate-50 p-4 rounded text-center font-mono text-lg" data-testid="record-barcode">
                {record.barcode}
              </div>
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {record.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{tag}</span>
              ))}
              {record.tags.length === 0 && <p className="text-sm text-slate-500">No tags</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
