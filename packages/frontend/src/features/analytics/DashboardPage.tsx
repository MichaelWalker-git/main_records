import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathRoundedSquareIcon,
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
  pendingClassification?: number;
  checkedOut?: number;
  onLegalHold?: number;
  disposedRecords?: number;
  recentActivity: { id: string; action: string; resource_type: string; user_email: string; created_at: string }[];
  recordsByType: { media_type: string; count: number }[];
}

const COLORS = ['#003366', '#2E5A3E', '#475569', '#0ea5e9', '#f59e0b', '#8b5cf6'];

interface MigrationStatus {
  imported: number;
  pendingMapping: number;
  failed: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: raw } = useApiQuery<any>(['dashboard'], '/analytics/dashboard');
  const { data: migrationRaw } = useApiQuery<any>(['migration-status'], '/analytics/migration-status');

  // Backend returns { data: metrics } or just metrics depending on unwrapping
  const data: DashboardData | undefined = raw?.data ?? raw;
  const migration: MigrationStatus | undefined = migrationRaw?.data ?? migrationRaw;

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

      {/* Migration Status (legacy → RMS parallel run) */}
      {migration && (migration.imported + migration.pendingMapping + migration.failed) > 0 && (
        <div className="bg-white border border-slate-200 rounded-md p-5 mb-6" data-testid="migration-status-widget">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowPathRoundedSquareIcon className="w-4 h-4 text-navy-500" />
              <h2 className="text-sm font-semibold text-slate-800">Legacy Migration Status</h2>
            </div>
            <span className="text-[11px] text-slate-400">Parallel run snapshot</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">Imported</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">{migration.imported.toLocaleString()}</p>
              <p className="text-[11px] text-emerald-700/70 mt-1">From legacy system</p>
            </div>
            <div className="rounded border border-amber-100 bg-amber-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold">Pending Mapping</p>
              <p className="text-2xl font-bold text-amber-800 mt-1 tabular-nums">{migration.pendingMapping.toLocaleString()}</p>
              <p className="text-[11px] text-amber-700/70 mt-1">Series or container missing</p>
            </div>
            <div className="rounded border border-red-100 bg-red-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-red-700 font-semibold">Failed</p>
              <p className="text-2xl font-bold text-red-800 mt-1 tabular-nums">{migration.failed.toLocaleString()}</p>
              <p className="text-[11px] text-red-700/70 mt-1">Need manual review</p>
            </div>
          </div>
        </div>
      )}

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
                <Pie
                  data={recordsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={1}
                  paddingAngle={1}
                >
                  {recordsByType.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }}
                  formatter={(value: number, name: string) => [value, name]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingLeft: 12 }}
                  formatter={(value: string, entry: any) => (
                    <span className="text-slate-600">
                      {value} <span className="text-slate-400 tabular-nums">({entry.payload.count})</span>
                    </span>
                  )}
                />
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
            {data.recentActivity.map((event: any) => {
              const ts = event.created_at || event.createdAt;
              const actor = event.user_email || event.userEmail;
              return (
                <div key={event.id} className="flex items-baseline gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap tabular-nums">
                    {ts
                      ? new Date(ts).toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </span>
                  <span className="text-slate-700">{event.action}</span>
                  <span className="text-slate-400 text-xs">{event.resource_type || event.resourceType}</span>
                  <span className="text-slate-400 text-xs">
                    {actor ? `by ${actor}` : 'by system'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}