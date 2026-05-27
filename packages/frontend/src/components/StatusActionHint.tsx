import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export type StatusContext = 'record' | 'transmittal' | 'disposition' | 'circulation';

interface StatusActionHintProps {
  status: string;
  context: StatusContext;
  resourceId?: string;
  canEdit?: boolean;
  canApprove?: boolean;
  className?: string;
}

interface ActionHint {
  label: string;
  to?: string;
  requires?: 'edit' | 'approve';
}

function getHint(status: string, context: StatusContext, resourceId?: string): ActionHint | null {
  if (context === 'record') {
    if (status === 'draft') return { label: 'Classify', to: resourceId ? `/records/${resourceId}` : undefined, requires: 'edit' };
    if (status === 'pending_disposition') return { label: 'Approve disposition', to: resourceId ? `/records/${resourceId}` : undefined, requires: 'approve' };
    if (status === 'on_hold') return { label: 'Review hold', to: resourceId ? `/records/${resourceId}` : undefined, requires: 'edit' };
    if (status === 'checked_out') return { label: 'Return', to: '/inventory/circulation', requires: 'edit' };
  }

  if (context === 'transmittal') {
    if (status === 'draft') return { label: 'Submit', requires: 'edit' };
    if (status === 'submitted') return { label: 'Receive', requires: 'approve' };
    if (status === 'received') return { label: 'Approve', requires: 'approve' };
  }

  if (context === 'disposition') {
    if (status === 'pending' || status === 'pending_approval') return { label: 'Review', requires: 'approve' };
  }

  return null;
}

export function StatusActionHint({ status, context, resourceId, canEdit = false, canApprove = false, className = '' }: StatusActionHintProps) {
  const hint = getHint(status, context, resourceId);
  if (!hint) return null;

  const allowed =
    (hint.requires === 'edit' && canEdit) ||
    (hint.requires === 'approve' && canApprove) ||
    !hint.requires;

  if (!allowed) return null;

  const content = (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-navy-600 hover:text-navy-700">
      {hint.label}
      <ArrowRightIcon className="w-3 h-3" />
    </span>
  );

  return (
    <span className={`inline-flex ${className}`} data-testid={`status-action-hint-${status}`}>
      {hint.to ? <Link to={hint.to}>{content}</Link> : content}
    </span>
  );
}
