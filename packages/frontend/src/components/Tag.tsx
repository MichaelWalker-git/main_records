import { ReactNode, MouseEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type TagVariant = 'default' | 'navy' | 'pine' | 'amber' | 'red' | 'slate';
export type TagSize = 'sm' | 'md';

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  navy: 'bg-navy-50 text-navy-700 border-navy-200',
  pine: 'bg-pine-50 text-pine-700 border-pine-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
};

const sizeStyles: Record<TagSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
};

export function Tag({ children, variant = 'default', size = 'sm', onClick, onRemove, className = '' }: TagProps) {
  const base = `inline-flex items-center gap-1 rounded border font-medium ${variantStyles[variant]} ${sizeStyles[size]}`;

  function handleRemove(e: MouseEvent) {
    e.stopPropagation();
    onRemove?.();
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} hover:opacity-80 transition-opacity ${className}`}
        data-testid="tag"
      >
        {children}
        {onRemove && (
          <span
            role="button"
            aria-label="Remove tag"
            tabIndex={0}
            onClick={handleRemove}
            className="hover:text-slate-900 cursor-pointer"
          >
            <XMarkIcon className="w-3 h-3" />
          </span>
        )}
      </button>
    );
  }

  return (
    <span className={`${base} ${className}`} data-testid="tag">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove tag"
          className="hover:text-slate-900"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
