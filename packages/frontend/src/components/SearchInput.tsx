import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  showSemanticToggle?: boolean;
  onSemanticToggle?: (enabled: boolean) => void;
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  showSemanticToggle,
  onSemanticToggle,
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const [semantic, setSemantic] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value.trim()) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounceMs]);

  return (
    <div className="flex items-center gap-2" role="search" aria-label="Search records" data-testid="search-input">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full h-8 pl-9 pr-3 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors"
          data-testid="search-input-field"
        />
      </div>
      {showSemanticToggle && (
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer" data-testid="semantic-toggle">
          <input
            type="checkbox"
            checked={semantic}
            onChange={(e) => {
              setSemantic(e.target.checked);
              onSemanticToggle?.(e.target.checked);
            }}
            className="rounded border-slate-300 text-navy-500 focus:ring-navy-500"
          />
          AI Search
        </label>
      )}
    </div>
  );
}
