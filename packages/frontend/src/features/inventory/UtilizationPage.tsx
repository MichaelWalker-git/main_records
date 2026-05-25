import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApiQuery } from '../../hooks/useApi';

interface UtilizationData {
  warehouses: { name: string; capacity: number; occupied: number }[];
  byType: { type: string; count: number }[];
  totalCapacity: number;
  totalOccupied: number;
}

const COLORS = ['#003366', '#2E5A3E', '#64748b', '#0ea5e9', '#f59e0b', '#ef4444'];

export function UtilizationPage() {
  const { data } = useApiQuery<UtilizationData>(['utilization'], '/inventory/utilization');

  const warehouseData = data?.warehouses ?? [];
  const typeData = data?.byType ?? [];
  const overallPercent = data ? Math.round((data.totalOccupied / data.totalCapacity) * 100) : 0;

  return (
    <div data-testid="utilization-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Warehouse Utilization</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Total Capacity</p>
          <p className="text-2xl font-bold text-slate-800">{data?.totalCapacity?.toLocaleString() ?? '-'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Total Occupied</p>
          <p className="text-2xl font-bold text-slate-800">{data?.totalOccupied?.toLocaleString() ?? '-'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Overall Utilization</p>
          <p className="text-2xl font-bold text-slate-800">{overallPercent}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6" data-testid="capacity-bar-chart">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Capacity by Warehouse</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={warehouseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="capacity" fill="#cbd5e1" name="Capacity" />
              <Bar dataKey="occupied" fill="#003366" name="Occupied" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6" data-testid="type-pie-chart">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Records by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={typeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label>
                {typeData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
