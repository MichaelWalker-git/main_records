interface ConfidenceMeterProps {
  score: number;
  threshold?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ConfidenceMeter({ score, threshold = 0.85, showLabel = true, size = 'sm', className = '' }: ConfidenceMeterProps) {
  const pct = Math.round(score * 100);
  const isAbove = score >= threshold;
  const color = isAbove ? 'bg-green-500' : score >= 0.5 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = isAbove ? 'text-green-700' : score >= 0.5 ? 'text-amber-700' : 'text-red-700';

  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const barWidth = size === 'sm' ? 'w-16' : 'w-24';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} data-testid="confidence-meter" title={`AI confidence: ${pct}% (threshold: ${Math.round(threshold * 100)}%)`}>
      <div className={`${barWidth} ${barHeight} bg-slate-100 rounded-full overflow-hidden`}>
        <div className={`${barHeight} ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className={`text-[10px] font-medium tabular-nums ${textColor}`}>{pct}%</span>
      )}
    </div>
  );
}
