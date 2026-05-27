import { Tag } from './Tag';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({ filters, onRemove, onClearAll, className = '' }: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`} data-testid="filter-bar">
      <span className="text-xs text-slate-500 font-medium">Active filters:</span>
      {filters.map((f) => (
        <Tag
          key={f.key}
          variant="navy"
          size="md"
          onRemove={() => onRemove(f.key)}
        >
          <span className="text-slate-500 font-normal">{f.label}:</span>
          <span>{f.value}</span>
        </Tag>
      ))}
      {filters.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-slate-500 hover:text-navy-600 underline"
          data-testid="filter-bar-clear-all"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
