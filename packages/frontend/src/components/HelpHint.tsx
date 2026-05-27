import { ReactNode } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from './Tooltip';

interface HelpHintProps {
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function HelpHint({ content, side = 'top', className = '' }: HelpHintProps) {
  return (
    <Tooltip content={content} side={side} className={className}>
      <span
        tabIndex={0}
        role="button"
        aria-label="More information"
        className="inline-flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-help"
        data-testid="help-hint"
      >
        <InformationCircleIcon className="w-3.5 h-3.5" />
      </span>
    </Tooltip>
  );
}
