import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface DashboardWidgetProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function DashboardWidget({ label, value, trend, trendValue, icon: Icon }: DashboardWidgetProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5" data-testid="dashboard-widget">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-navy-50 rounded-lg">
            <Icon className="w-5 h-5 text-navy-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className="flex items-center mt-3">
          {trend === 'up' && <ArrowUpIcon className="w-3 h-3 text-green-500" />}
          {trend === 'down' && <ArrowDownIcon className="w-3 h-3 text-red-500" />}
          <span
            className={`text-xs font-medium ml-1 ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {trendValue}
          </span>
          <span className="text-xs text-slate-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}
