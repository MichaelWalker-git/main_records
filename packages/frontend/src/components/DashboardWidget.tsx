import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface DashboardWidgetProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  to?: string;
}

export function DashboardWidget({ label, value, trend, trendValue, icon: Icon, to }: DashboardWidgetProps) {
  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? { to } : {};
  return (
    <Wrapper {...wrapperProps as any} className={`bg-white border border-slate-200 rounded-md p-4 ${to ? 'hover:border-navy-300 hover:shadow-sm transition-all cursor-pointer' : ''}`} data-testid="dashboard-widget">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-navy-50 rounded">
            <Icon className="w-5 h-5 text-navy-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className="flex items-center mt-2 pt-2 border-t border-slate-100">
          {trend === 'up' && <ArrowUpIcon className="w-3 h-3 text-pine-500" />}
          {trend === 'down' && <ArrowDownIcon className="w-3 h-3 text-red-500" />}
          <span
            className={`text-xs font-medium ml-1 ${
              trend === 'up' ? 'text-pine-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {trendValue}
          </span>
          <span className="text-xs text-slate-400 ml-1">vs last month</span>
        </div>
      )}
    </Wrapper>
  );
}