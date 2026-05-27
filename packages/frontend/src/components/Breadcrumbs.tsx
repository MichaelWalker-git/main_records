import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, showHome = true, className = '' }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', to: '/dashboard' }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm overflow-x-auto ${className}`} data-testid="breadcrumbs">
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1;
          const isHome = showHome && i === 0;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              {isLast || !item.to ? (
                <span className="text-slate-700 font-medium flex items-center gap-1" aria-current={isLast ? 'page' : undefined}>
                  {isHome && <HomeIcon className="w-3.5 h-3.5" />}
                  {!isHome && item.label}
                </span>
              ) : (
                <Link to={item.to} className="text-slate-500 hover:text-navy-600 transition-colors flex items-center gap-1">
                  {isHome ? <HomeIcon className="w-3.5 h-3.5" /> : item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
