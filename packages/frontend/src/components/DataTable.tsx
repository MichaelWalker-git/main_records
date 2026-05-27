import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { EmptyState } from './EmptyState';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (key: string, value: string) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onSort,
  pagination,
  onPageChange,
  keyExtractor,
  isLoading,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  }

  const safeData = Array.isArray(data) ? data : [];

  if (!isLoading && safeData.length === 0) {
    return <EmptyState title="No results found" message="Try adjusting your filters or search criteria." />;
  }

  return (
    <div data-testid="data-table">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-500 rounded"
                      onClick={() => handleSort(col.key)}
                      aria-label={`Sort by ${col.label}`}
                      data-testid={`sort-${col.key}`}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === 'asc' ? <ChevronUpIcon className="w-3 h-3" aria-hidden="true" /> : <ChevronDownIcon className="w-3 h-3" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {safeData.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-sm text-slate-700">
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <nav className="flex items-center justify-between px-4 py-3 border-t border-slate-100" aria-label="Table pagination" data-testid="pagination">
          <p className="text-xs text-slate-500" aria-live="polite">
            {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.page <= 1}
              className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
              aria-label="First page"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
              aria-label="Previous page"
              data-testid="pagination-prev"
            >
              ‹
            </button>
            {(() => {
              const pages: number[] = [];
              const total = pagination.totalPages;
              const current = pagination.page;
              let start = Math.max(1, current - 2);
              let end = Math.min(total, current + 2);
              if (end - start < 4) {
                start = Math.max(1, end - 4);
                end = Math.min(total, start + 4);
              }
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 text-xs rounded ${
                    p === current
                      ? 'bg-navy-500 text-white font-medium'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === current ? 'page' : undefined}
                >
                  {p}
                </button>
              ));
            })()}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
              aria-label="Next page"
              data-testid="pagination-next"
            >
              ›
            </button>
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
