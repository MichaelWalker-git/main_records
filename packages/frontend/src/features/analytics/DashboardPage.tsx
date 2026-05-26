import {
  DocumentTextIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DashboardWidget } from '../../components/DashboardWidget';
import { useApiQuery } from '../../hooks/useApi';

interface DashboardData {
  metrics: {
    activeRecords: number;
    activeRecordsTrend: string;
    pendingDispositions: number;
    openTransfers: number;
    overdueItems: number;
  };
  recordsByAgency: { agency: string; count: number }[];
  dispositionsOverTime: { month: string; count: number }[];
  utilizationByType: { type: string; value: number }[];
}

const COLORS = ['#003366', '#2E5A3E', '#475569', '#0ea5e9', '#f59e0b'];

export function DashboardPage() {
  const { data } = useApiQuery<DashboardData>(['dashboard'], '/analytics/dashboard');

  const metrics = data?.metrics;

  return (
    <div data-testid="dashboard-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Records management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardWidget
          label="Active Records"
          value={metrics?.activeRecords?.toLocaleString() ?? '—'}
          trend="up"
          trendValue={metrics?.activeRecordsTrend ?? ''}
          icon={DocumentTextIcon}
        />
        <DashboardWidget
          label="Pending Dispositions"
          value={metrics?.pendingDispositions ?? '—'}
          icon={ClockIcon}
        />
        <DashboardWidget
          label="Open Transfers"
          value={metrics?.openTransfers ?? '—'}
          icon={TruckIcon}
        />
        <DashboardWidget
          label="Overdue Items"
          value={metrics?.overdueItems ?? '—'}
          trend={metrics?.overdueItems && metrics.overdueItems > 0 ? 'up' : undefined}
          trendValue={metrics?.overdueItems && metrics.overdueItems > 0 ? 'Needs attention' : undefined}
          icon={ExclamationTriangleIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="records-by-agency-chart">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Records by Agency</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.recordsByAgency ?? []} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="agency" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="count" fill="#003366" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="dispositions-over-time-chart">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Dispositions Over Time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.dispositionsOverTime ?? []} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Line type="monotone" dataKey="count" stroke="#2E5A3E" strokeWidth={2} dot={{ r: 3, fill: '#2E5A3E' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="utilization-donut-chart">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Storage Utilization</h2>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data?.utilizationByType ?? []} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={60} outerRadius={95} label={{ fontSize: 12 }} strokeWidth={1}>
              {(data?.utilizationByType ?? []).map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}