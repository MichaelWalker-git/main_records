import { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  delta?: { value: number; label?: string };
  onClick?: () => void;
  className?: string;
}

export function KpiCard({ label, value, icon, delta, onClick, className = '' }: KpiCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-md p-4 ${isClickable ? 'cursor-pointer hover:border-navy-300 hover:shadow-sm transition-all' : ''} ${className}`}
      data-testid="kpi-card"
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter') onClick?.(); } : undefined}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-800">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {delta && (
          <span className={`text-xs font-medium ${delta.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {delta.value >= 0 ? '+' : ''}{delta.value}%
            {delta.label && <span className="text-slate-400 ml-0.5">{delta.label}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
