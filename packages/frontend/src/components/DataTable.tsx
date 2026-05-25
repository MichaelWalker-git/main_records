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

  if (!isLoading && data.length === 0) {
    return <EmptyState title="No results found" message="Try adjusting your filters or search criteria." />;
  }

  return (
    <div data-testid="data-table">
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:text-slate-700 focus:outline-none"
                      onClick={() => handleSort(col.key)}
                      data-testid={`sort-${col.key}`}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && (
        <div className="flex items-center justify-between mt-4" data-testid="pagination">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
              data-testid="pagination-prev"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-sm border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
              data-testid="pagination-next"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
