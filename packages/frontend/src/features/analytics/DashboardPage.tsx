import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DashboardWidget } from '../../components/DashboardWidget';
import { useApiQuery } from '../../hooks/useApi';

interface DashboardData {
  totalRecords: number;
  activeRecords: number;
  pendingTransmittals: number;
  pendingDispositions: number;
  overdueCheckouts: number;
  recentActivity: { id: string; action: string; resource_type: string; user_email: string; created_at: string }[];
  recordsByType: { media_type: string; count: number }[];
}

const COLORS = ['#003366', '#2E5A3E', '#475569', '#0ea5e9', '#f59e0b', '#8b5cf6'];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: raw } = useApiQuery<any>(['dashboard'], '/analytics/dashboard');

  // Backend returns { data: metrics } or just metrics depending on unwrapping
  const data: DashboardData | undefined = raw?.data ?? raw;

  const recordsByType = (data?.recordsByType ?? []).map((r: any) => ({
    type: r.media_type || r.mediaType || 'Unknown',
    count: Number(r.count),
  }));

  return (
    <div data-testid="dashboard-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Records management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardWidget
          label="Total Records"
          value={data?.totalRecords?.toLocaleString() ?? '—'}
          icon={DocumentTextIcon}
          to="/records"
        />
        <DashboardWidget
          label="Pending Dispositions"
          value={data?.pendingDispositions ?? '—'}
          icon={ClockIcon}
          to="/dispositions"
        />
        <DashboardWidget
          label="Open Transfers"
          value={data?.pendingTransmittals ?? '—'}
          icon={TruckIcon}
          to="/transmittals"
        />
        <DashboardWidget
          label="Overdue Checkouts"
          value={data?.overdueCheckouts ?? '—'}
          trend={data?.overdueCheckouts && data.overdueCheckouts > 0 ? 'up' : undefined}
          trendValue={data?.overdueCheckouts && data.overdueCheckouts > 0 ? 'Needs attention' : undefined}
          icon={ExclamationTriangleIcon}
          to="/inventory/circulation"
        />
      </div>

      {/* Lifecycle Pipeline */}
      {data && (
        <div className="bg-white border border-slate-200 rounded-md p-5 mb-6" data-testid="lifecycle-pipeline">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Record Lifecycle Pipeline</h2>
          <div className="flex items-center justify-between">
            {[
              { label: 'Pending Classification', value: data.pendingClassification || 0, status: 'active' },
              { label: 'Active / Stored', value: data.activeRecords || 0, status: 'active' },
              { label: 'Checked Out', value: data.checkedOut || 0, status: 'checked_out' },
              { label: 'On Hold', value: data.onLegalHold || 0, status: 'on_hold' },
              { label: 'Pending Disposition', value: data.pendingDispositions || 0, status: 'pending_disposition' },
              { label: 'Disposed', value: data.disposedRecords || 0, status: 'disposed' },
            ].map((stage, i, arr) => (
              <div key={stage.label} className="flex items-center flex-1">
                <button
                  onClick={() => navigate(`/records?status=${stage.status}`)}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded hover:bg-slate-50 transition-colors w-full"
                >
                  <span className="text-lg font-bold text-slate-800">{stage.value}</span>
                  <span className="text-[10px] text-slate-500 text-center leading-tight">{stage.label}</span>
                </button>
                {i < arr.length - 1 && (
                  <div className="w-6 h-px bg-slate-200 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="records-by-type-chart">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Records by Media Type</h2>
          {recordsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={recordsByType} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Bar dataKey="count" fill="#003366" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No data available</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="utilization-donut-chart">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Storage Utilization</h2>
          {recordsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={recordsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={60} outerRadius={95} label={{ fontSize: 12 }} strokeWidth={1}>
                  {recordsByType.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h2>
        {(!data?.recentActivity || data.recentActivity.length === 0) ? (
          <p className="text-sm text-slate-400">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((event: any) => (
              <div key={event.id} className="flex items-baseline gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap tabular-nums">
                  {new Date(event.created_at || event.createdAt).toLocaleDateString()}
                </span>
                <span className="text-slate-700">{event.action}</span>
                <span className="text-slate-400 text-xs">{event.resource_type || event.resourceType}</span>
                <span className="text-slate-400 text-xs">by {event.user_email || event.userEmail}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}