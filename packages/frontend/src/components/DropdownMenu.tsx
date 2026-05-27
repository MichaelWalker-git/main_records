import { useState, useRef, useEffect, ReactNode, KeyboardEvent } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  to?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: false;
}

export interface DropdownSeparator {
  key: string;
  separator: true;
}

export type DropdownEntry = DropdownItem | DropdownSeparator;

interface DropdownMenuProps {
  items: DropdownEntry[];
  trigger?: ReactNode;
  align?: 'left' | 'right';
  triggerLabel?: string;
  className?: string;
}

function isItem(entry: DropdownEntry): entry is DropdownItem {
  return !('separator' in entry && entry.separator === true);
}

export function DropdownMenu({
  items,
  trigger,
  align = 'right',
  triggerLabel = 'Open menu',
  className = '',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const interactiveItems = items.filter(isItem).filter((i) => !i.disabled);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setFocusedIndex(-1);
      return;
    }
    if (focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  function handleTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      setFocusedIndex(0);
    }
  }

  function handleItemKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((index + 1) % interactiveItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((index - 1 + interactiveItems.length) % interactiveItems.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusedIndex(interactiveItems.length - 1);
    }
  }

  function activate(item: DropdownItem) {
    if (item.disabled) return;
    setOpen(false);
    item.onClick?.();
  }

  let interactiveIndex = -1;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} data-testid="dropdown-menu">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setOpen(true);
            setFocusedIndex(0);
          }
        }}
        onKeyDown={handleTriggerKey}
        className="inline-flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        data-testid="dropdown-trigger"
      >
        {trigger ?? <EllipsisVerticalIcon className="w-4 h-4" />}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-30 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
          data-testid="dropdown-panel"
        >
          {items.map((entry) => {
            if (!isItem(entry)) {
              return <div key={entry.key} role="separator" className="border-t border-slate-100 my-1" />;
            }
            interactiveIndex++;
            const idx = interactiveIndex;
            const itemClass = `w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              entry.disabled
                ? 'text-slate-300 cursor-not-allowed'
                : entry.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-slate-700 hover:bg-slate-50'
            }`;

            return (
              <button
                key={entry.key}
                ref={(el) => { itemRefs.current[idx] = el; }}
                type="button"
                role="menuitem"
                onClick={() => activate(entry)}
                onKeyDown={(e) => handleItemKey(e, idx)}
                disabled={entry.disabled}
                className={itemClass}
                data-testid={`dropdown-item-${entry.key}`}
              >
                {entry.icon && <span className="flex-shrink-0">{entry.icon}</span>}
                {entry.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
