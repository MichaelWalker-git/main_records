import { Link } from 'react-router-dom';
import { DocumentTextIcon, TruckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { DashboardWidget } from '../../components/DashboardWidget';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { useApiQuery } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Transmittal } from '../../types';
import { format } from 'date-fns';

interface AgencyDashboardData {
  myTransfers: number;
  myRequests: number;
  retentionAlerts: number;
  recentTransmittals: Transmittal[];
}

export function AgencyDashboardPage() {
  const { user } = useAuth();
  const { data } = useApiQuery<AgencyDashboardData>(['agency-dashboard'], '/agency/dashboard');

  const columns = [
    { key: 'trackingNumber', label: 'Tracking #' },
    { key: 'itemCount', label: 'Items' },
    { key: 'status', label: 'Status', render: (t: Transmittal) => <StatusBadge status={t.status} /> },
    { key: 'submittedAt', label: 'Submitted', render: (t: Transmittal) => t.submittedAt ? format(new Date(t.submittedAt), 'MMM d, yyyy') : '-' },
  ];

  return (
    <div data-testid="agency-dashboard-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Agency Portal</h1>
        <p className="text-sm text-slate-500 mt-0.5">{user?.agencyName || 'Manage your agency records'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardWidget label="My Transfers" value={data?.myTransfers ?? '-'} icon={TruckIcon} />
        <DashboardWidget label="My Requests" value={data?.myRequests ?? '-'} icon={DocumentTextIcon} />
        <DashboardWidget
          label="Retention Alerts"
          value={data?.retentionAlerts ?? '-'}
          trend={data?.retentionAlerts && data.retentionAlerts > 0 ? 'up' : undefined}
          trendValue={data?.retentionAlerts && data.retentionAlerts > 0 ? 'Action needed' : undefined}
          icon={ExclamationTriangleIcon}
        />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/agency/accession"
          className="inline-flex items-center h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 transition-colors"
          data-testid="submit-accession-link"
        >
          Submit Accession
        </Link>
        <Link
          to="/agency/reference"
          className="inline-flex items-center h-9 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          data-testid="reference-request-link"
        >
          Reference Request
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Transmittals</h2>
        <DataTable columns={columns} data={data?.recentTransmittals ?? []} keyExtractor={(t) => t.id} />
      </div>
    </div>
  );
}
