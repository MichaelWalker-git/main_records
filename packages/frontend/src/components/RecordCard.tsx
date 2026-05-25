import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { RMSRecord as Record } from '../types';

interface RecordCardProps {
  record: Record;
}

export function RecordCard({ record }: RecordCardProps) {
  return (
    <Link
      to={`/records/${record.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      data-testid={`record-card-${record.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-mono">{record.trackingNumber}</p>
          <h3 className="text-sm font-medium text-slate-800 mt-1 truncate">{record.title}</h3>
          <p className="text-xs text-slate-500 mt-1">{record.seriesTitle}</p>
          <p className="text-xs text-slate-500">{record.agencyName}</p>
        </div>
        <StatusBadge status={record.status} variant="small" />
      </div>
      {record.locationPath && (
        <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
          <MapPinIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{record.locationPath}</span>
        </div>
      )}
    </Link>
  );
}
