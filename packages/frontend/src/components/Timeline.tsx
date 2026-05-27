import { ReactNode } from 'react';

export interface TimelineEvent {
  id: string;
  icon?: ReactNode;
  label: string;
  actor?: string;
  timestamp?: string;
  details?: string;
  badge?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const variantColors: Record<string, { dot: string; line: string }> = {
  default: { dot: 'bg-slate-300', line: 'bg-slate-200' },
  success: { dot: 'bg-green-500', line: 'bg-green-200' },
  warning: { dot: 'bg-amber-500', line: 'bg-amber-200' },
  danger: { dot: 'bg-red-500', line: 'bg-red-200' },
};

export function Timeline({ events, className = '' }: TimelineProps) {
  if (events.length === 0) return null;

  return (
    <div className={`relative ${className}`} data-testid="timeline">
      {events.map((event, i) => {
        const colors = variantColors[event.variant || 'default'];
        const isLast = i === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <div className={`absolute left-[9px] top-[22px] bottom-0 w-px ${colors.line}`} />
            )}

            {/* Dot or icon */}
            <div className="relative flex-shrink-0 mt-0.5">
              {event.icon ? (
                <div className="w-[18px] h-[18px] flex items-center justify-center">{event.icon}</div>
              ) : (
                <div className={`w-[18px] h-[18px] rounded-full border-2 border-white ${colors.dot} shadow-sm`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-700">{event.label}</span>
                {event.badge}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {event.actor && (
                  <span className="text-xs text-slate-500">{event.actor}</span>
                )}
                {event.actor && event.timestamp && (
                  <span className="text-xs text-slate-300">·</span>
                )}
                {event.timestamp && (
                  <span className="text-xs text-slate-400 font-mono tabular-nums">{event.timestamp}</span>
                )}
              </div>
              {event.details && (
                <p className="text-xs text-slate-500 mt-1">{event.details}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
