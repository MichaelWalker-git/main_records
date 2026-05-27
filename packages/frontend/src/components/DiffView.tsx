interface DiffViewProps {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  className?: string;
}

function format(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function DiffView({ before, after, className = '' }: DiffViewProps) {
  const beforeObj = before || {};
  const afterObj = after || {};
  const allKeys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)])).sort();

  const changedKeys = allKeys.filter((k) => format(beforeObj[k]) !== format(afterObj[k]));

  if (changedKeys.length === 0) {
    return <p className={`text-sm text-slate-400 ${className}`} data-testid="diff-view-empty">No changes recorded</p>;
  }

  return (
    <div className={`space-y-1 text-xs ${className}`} data-testid="diff-view">
      {changedKeys.map((key) => {
        const oldVal = format(beforeObj[key]);
        const newVal = format(afterObj[key]);
        const isAdd = oldVal === '—' && newVal !== '—';
        const isRemove = oldVal !== '—' && newVal === '—';

        return (
          <div key={key} className="flex items-start gap-2 py-1 border-b border-slate-50 last:border-0">
            <span className="font-medium text-slate-600 w-32 flex-shrink-0 truncate">{key}</span>
            <div className="flex-1 min-w-0 space-y-0.5">
              {!isAdd && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-red-500 font-mono text-[10px]">−</span>
                  <span className="text-red-700 bg-red-50 px-1 rounded line-through truncate">{oldVal}</span>
                </div>
              )}
              {!isRemove && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-green-600 font-mono text-[10px]">+</span>
                  <span className="text-green-700 bg-green-50 px-1 rounded truncate">{newVal}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
