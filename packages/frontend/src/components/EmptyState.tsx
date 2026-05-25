import { FolderOpenIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = FolderOpenIcon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state">
      <Icon className="w-12 h-12 text-slate-300 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-slate-700">{title}</h3>
      {message && <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
