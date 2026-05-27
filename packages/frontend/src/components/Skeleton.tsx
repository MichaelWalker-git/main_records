import { CSSProperties } from 'react';

type SkeletonVariant = 'block' | 'text' | 'circle' | 'table-row';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  count?: number;
  className?: string;
}

export function Skeleton({ variant = 'block', width, height, count = 1, className = '' }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-slate-200';

  if (variant === 'table-row') {
    return (
      <div className={`flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 ${className}`} data-testid="skeleton">
        <div className={`${baseClass} h-4 w-1/4 rounded`} />
        <div className={`${baseClass} h-4 w-1/3 rounded`} />
        <div className={`${baseClass} h-4 w-16 rounded`} />
        <div className={`${baseClass} h-4 w-20 rounded`} />
      </div>
    );
  }

  const styleByVariant: Record<SkeletonVariant, { shape: string; defaultHeight: string; defaultWidth: string }> = {
    block: { shape: 'rounded-md', defaultHeight: 'h-16', defaultWidth: 'w-full' },
    text: { shape: 'rounded', defaultHeight: 'h-3.5', defaultWidth: 'w-full' },
    circle: { shape: 'rounded-full', defaultHeight: 'h-10', defaultWidth: 'w-10' },
    'table-row': { shape: '', defaultHeight: '', defaultWidth: '' },
  };

  const v = styleByVariant[variant];
  const style: CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;

  const items = Array.from({ length: count });

  return (
    <div className={count > 1 ? 'space-y-2' : ''} data-testid="skeleton">
      {items.map((_, i) => (
        <div
          key={i}
          className={`${baseClass} ${v.shape} ${width === undefined ? v.defaultWidth : ''} ${height === undefined ? v.defaultHeight : ''} ${className}`}
          style={style}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
