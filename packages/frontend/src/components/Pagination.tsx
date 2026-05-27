interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageSize, total, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function pageNumbers(): number[] {
    const pages: number[] = [];
    let s = Math.max(1, page - 2);
    let e = Math.min(totalPages, page + 2);
    if (e - s < 4) {
      s = Math.max(1, e - 4);
      e = Math.min(totalPages, s + 4);
    }
    for (let i = s; i <= e; i++) pages.push(i);
    return pages;
  }

  return (
    <nav
      className={`flex items-center justify-between px-4 py-3 border-t border-slate-100 ${className}`}
      aria-label="Table pagination"
      data-testid="pagination"
    >
      <p className="text-xs text-slate-500" aria-live="polite">
        {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
          aria-label="First page"
        >
          «
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
          aria-label="Previous page"
          data-testid="pagination-prev"
        >
          ‹
        </button>
        {pageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs rounded ${
              p === page
                ? 'bg-navy-500 text-white font-medium'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
          aria-label="Next page"
          data-testid="pagination-next"
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="w-8 h-8 text-xs border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-50 text-slate-600"
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </nav>
  );
}
