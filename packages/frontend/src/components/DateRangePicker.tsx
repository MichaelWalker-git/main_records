import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface DateRange {
  from: string | null;
  to: string | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

interface Preset {
  key: string;
  label: string;
  compute: () => DateRange;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

const PRESETS: Preset[] = [
  { key: 'today', label: 'Today', compute: () => ({ from: iso(daysAgo(0)), to: iso(daysAgo(0)) }) },
  { key: '7d', label: 'Last 7 days', compute: () => ({ from: iso(daysAgo(7)), to: iso(daysAgo(0)) }) },
  { key: '30d', label: 'Last 30 days', compute: () => ({ from: iso(daysAgo(30)), to: iso(daysAgo(0)) }) },
  {
    key: 'quarter',
    label: 'This quarter',
    compute: () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3);
      return { from: iso(new Date(now.getFullYear(), q * 3, 1)), to: iso(daysAgo(0)) };
    },
  },
  {
    key: 'year',
    label: 'This year',
    compute: () => {
      const now = new Date();
      return { from: iso(new Date(now.getFullYear(), 0, 1)), to: iso(daysAgo(0)) };
    },
  },
];

function formatDisplay(range: DateRange): string {
  if (!range.from && !range.to) return 'Any date';
  if (range.from && range.to && range.from === range.to) return range.from;
  if (range.from && range.to) return `${range.from} → ${range.to}`;
  if (range.from) return `From ${range.from}`;
  return `Until ${range.to}`;
}

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`} data-testid="date-range-picker">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 border border-slate-300 rounded-md text-sm bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="date-range-trigger"
      >
        <CalendarIcon className="w-4 h-4 text-slate-400" />
        <span className="text-slate-700">{formatDisplay(value)}</span>
        <ChevronDownIcon className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-md shadow-lg p-3 w-80"
          data-testid="date-range-dropdown"
        >
          <div className="grid grid-cols-2 gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => { onChange(p.compute()); setOpen(false); }}
                className="text-left text-xs px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700"
                data-testid={`date-preset-${p.key}`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { onChange({ from: null, to: null }); setOpen(false); }}
              className="text-left text-xs px-2 py-1.5 rounded hover:bg-slate-50 text-slate-500 col-span-2"
              data-testid="date-preset-clear"
            >
              Clear / Any date
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <label className="block text-[11px] font-medium text-slate-500 uppercase">Custom range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={value.from ?? ''}
                onChange={(e) => onChange({ ...value, from: e.target.value || null })}
                className="flex-1 h-8 px-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                data-testid="date-range-from"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={value.to ?? ''}
                onChange={(e) => onChange({ ...value, to: e.target.value || null })}
                className="flex-1 h-8 px-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                data-testid="date-range-to"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
