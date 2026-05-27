import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useApiQuery } from '../../hooks/useApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const COLORS = ['#003366', '#2E5A3E', '#475569', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

interface AnalyticsData {
  recordsByAgency: { agency: string; agencyName: string; count: number }[];
  recordsByStatus: { status: string; count: number }[];
  recordsByMediaType: { media_type?: string; mediaType?: string; count: number }[];
  transmittalsByStatus: { status: string; count: number }[];
  dispositionsByAction: { action: string; status: string; count: number }[];
  storageUtilization: { name: string; code: string; locationType?: string; location_type?: string; capacity: number; currentCount?: number; current_count?: number }[];
  retentionOverview: { code: string; name: string; recordCount?: number; record_count?: number; retentionYears?: number; retention_years?: number; dispositionAction?: string; disposition_action?: string }[];
  storageTotal: { totalCapacity: number; totalUsed: number; utilizationPercent: number };
}

export function AnalyticsPage() {
  const { data: raw, isLoading } = useApiQuery<any>(['analytics-detailed'], '/analytics/detailed');

  const data: AnalyticsData | undefined = raw?.data ?? raw;

  if (isLoading || !data) {
    return (
      <div data-testid="analytics-page">
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  const agencyChart = (data.recordsByAgency || []).map((r) => ({
    agency: r.agency,
    name: r.agencyName,
    records: Number(r.count),
  }));

  const statusChart = (data.recordsByStatus || []).map((r) => ({
    status: r.status?.replace(/_/g, ' ') || 'Unknown',
    count: Number(r.count),
  }));

  const mediaChart = (data.recordsByMediaType || []).map((r) => ({
    type: r.mediaType || r.media_type || 'Unknown',
    count: Number(r.count),
  }));

  const transmittalChart = (data.transmittalsByStatus || []).map((r) => ({
    status: r.status?.replace(/_/g, ' ') || 'Unknown',
    count: Number(r.count),
  }));

  const retentionChart = (data.retentionOverview || []).map((r) => ({
    schedule: r.code,
    name: r.name,
    records: Number(r.recordCount ?? r.record_count ?? 0),
    years: r.retentionYears ?? r.retention_years ?? 0,
    action: r.dispositionAction ?? r.disposition_action ?? '',
  }));

  const storageLocations = (data.storageUtilization || [])
    .filter((l) => Number(l.capacity) > 0)
    .map((l) => {
      const capacity = Number(l.capacity) || 1;
      const used = Number(l.currentCount ?? l.current_count ?? 0);
      return {
        name: l.name,
        used,
        available: capacity - used,
        percent: Math.round((used / capacity) * 100),
      };
    });

  const totalRecords = statusChart.reduce((s, r) => s + r.count, 0);
  const storageTotal = data.storageTotal || { totalCapacity: 0, totalUsed: 0, utilizationPercent: 0 };

  return (
    <div data-testid="analytics-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Detailed insights into records management operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <p className="text-[11px] text-slate-400 uppercase font-medium">Total Records</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalRecords}</p>
          <p className="text-xs text-slate-400 mt-1">{agencyChart.length} agencies</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <p className="text-[11px] text-slate-400 uppercase font-medium">Storage Utilization</p>
          <p className="text-2xl font-bold text-navy-600 mt-1">{storageTotal.utilizationPercent || 0}%</p>
          <p className="text-xs text-slate-400 mt-1">{(storageTotal.totalUsed || 0).toLocaleString()} / {(storageTotal.totalCapacity || 0).toLocaleString()} slots</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <p className="text-[11px] text-slate-400 uppercase font-medium">Retention Schedules</p>
          <p className="text-2xl font-bold text-pine-600 mt-1">{retentionChart.length}</p>
          <p className="text-xs text-slate-400 mt-1">{retentionChart.filter((r) => r.records > 0).length} with assigned records</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <p className="text-[11px] text-slate-400 uppercase font-medium">Transmittals</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{transmittalChart.reduce((s, r) => s + r.count, 0)}</p>
          <p className="text-xs text-slate-400 mt-1">{transmittalChart.find((t) => t.status === 'submitted')?.count || 0} pending review</p>
        </div>
      </div>

      {/* Row 1: Records by Agency + Record Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Records by Agency</h2>
          {agencyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agencyChart} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="agency" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }}
                  formatter={(value: number) => [value, 'Records']}
                  labelFormatter={(label) => agencyChart.find((a) => a.agency === label)?.name || label}
                />
                <Bar dataKey="records" fill="#003366" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No data</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Record Status Distribution</h2>
          {statusChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={1}
                  paddingAngle={1}
                >
                  {statusChart.map((_, index) => (
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
            <p className="text-sm text-slate-400 py-8 text-center">No data</p>
          )}
        </div>
      </div>

      {/* Row 2: Retention Compliance + Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Retention Schedule Coverage</h2>
          {retentionChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={retentionChart} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="schedule" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }}
                  formatter={(value: number, _name: string, props: any) => [value, `${props.payload.name} (${props.payload.years}yr, ${props.payload.action})`]}
                />
                <Bar dataKey="records" fill="#2E5A3E" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No retention data</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Storage Capacity</h2>
          {storageLocations.length > 0 ? (
            <div className="space-y-3">
              {storageLocations.map((loc) => (
                <div key={loc.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{loc.name}</span>
                    <span className="text-[11px] text-slate-400">{loc.used}/{loc.used + loc.available} ({loc.percent}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        loc.percent > 90 ? 'bg-red-500' : loc.percent > 70 ? 'bg-amber-500' : 'bg-navy-500'
                      }`}
                      style={{ width: `${loc.percent}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Overall</span>
                  <span className="text-xs font-semibold text-slate-700">{storageTotal.utilizationPercent}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      storageTotal.utilizationPercent > 90 ? 'bg-red-500' : storageTotal.utilizationPercent > 70 ? 'bg-amber-500' : 'bg-navy-500'
                    }`}
                    style={{ width: `${storageTotal.utilizationPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No storage data</p>
          )}
        </div>
      </div>

      {/* Row 3: Media Type + Transmittal Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Records by Media Type</h2>
          {mediaChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={mediaChart} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} strokeWidth={1} label>
                  {mediaChart.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No data</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Transfer Pipeline</h2>
          {transmittalChart.length > 0 ? (
            <div className="space-y-4">
              {transmittalChart.map((t, i) => (
                <div key={t.status} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-slate-700 capitalize flex-1">{t.status}</span>
                  <span className="text-lg font-bold text-slate-800">{t.count}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total transmittals</span>
                  <span className="text-sm font-semibold text-slate-700">{transmittalChart.reduce((s, r) => s + r.count, 0)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No transmittal data</p>
          )}
        </div>
      </div>
    </div>
  );
}