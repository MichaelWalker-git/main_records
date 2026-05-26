interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'small';
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-slate-100 text-slate-700',
  pending: 'bg-yellow-100 text-yellow-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  pending_disposition: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  transferred: 'bg-blue-100 text-blue-800',
  archived: 'bg-indigo-100 text-indigo-800',
  destroyed: 'bg-red-100 text-red-800',
  disposed: 'bg-red-100 text-red-700',
  on_hold: 'bg-orange-100 text-orange-800',
  checked_out: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-cyan-100 text-cyan-800',
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-800',
  received: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-700';
  const sizeClass = variant === 'small' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClass}`}
      data-testid={`status-badge-${status}`}
    >
      {label}
    </span>
  );
}
