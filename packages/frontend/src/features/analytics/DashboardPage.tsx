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

const COLORS = ['#003366', '#2E5A3E', '#64748b', '#0ea5e9', '#f59e0b'];

export function DashboardPage() {
  const { data } = useApiQuery<DashboardData>(['dashboard'], '/analytics/dashboard');

  const metrics = data?.metrics;

  return (
    <div data-testid="dashboard-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardWidget
          label="Active Records"
          value={metrics?.activeRecords?.toLocaleString() ?? '-'}
          trend="up"
          trendValue={metrics?.activeRecordsTrend ?? ''}
          icon={DocumentTextIcon}
        />
        <DashboardWidget
          label="Pending Dispositions"
          value={metrics?.pendingDispositions ?? '-'}
          icon={ClockIcon}
        />
        <DashboardWidget
          label="Open Transfers"
          value={metrics?.openTransfers ?? '-'}
          icon={TruckIcon}
        />
        <DashboardWidget
          label="Overdue Items"
          value={metrics?.overdueItems ?? '-'}
          trend={metrics?.overdueItems && metrics.overdueItems > 0 ? 'up' : undefined}
          trendValue={metrics?.overdueItems && metrics.overdueItems > 0 ? 'Needs attention' : undefined}
          icon={ExclamationTriangleIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6" data-testid="records-by-agency-chart">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Records by Agency</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.recordsByAgency ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agency" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#003366" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6" data-testid="dispositions-over-time-chart">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Dispositions Over Time</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.dispositionsOverTime ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2E5A3E" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6" data-testid="utilization-donut-chart">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Storage Utilization</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data?.utilizationByType ?? []} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
              {(data?.utilizationByType ?? []).map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
