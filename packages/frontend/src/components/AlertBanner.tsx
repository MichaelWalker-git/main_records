import { ReactNode } from 'react';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type AlertVariant = 'info' | 'warning' | 'danger' | 'success';

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: string; title: string; text: string; defaultIcon: typeof InformationCircleIcon }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    text: 'text-blue-800',
    defaultIcon: InformationCircleIcon,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-900',
    text: 'text-amber-800',
    defaultIcon: ExclamationTriangleIcon,
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    title: 'text-red-900',
    text: 'text-red-800',
    defaultIcon: XCircleIcon,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    title: 'text-green-900',
    text: 'text-green-800',
    defaultIcon: CheckCircleIcon,
  },
};

export function AlertBanner({ variant = 'info', title, children, icon, action, onDismiss, className = '' }: AlertBannerProps) {
  const s = variantStyles[variant];
  const IconComponent = s.defaultIcon;

  return (
    <div
      role="alert"
      data-testid="alert-banner"
      data-variant={variant}
      className={`flex items-start gap-3 ${s.bg} ${s.border} border rounded-md p-4 ${className}`}
    >
      <div className={`flex-shrink-0 ${s.icon}`}>
        {icon || <IconComponent className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-medium ${s.title}`}>{title}</p>}
        <div className={`text-sm ${s.text} ${title ? 'mt-0.5' : ''}`}>{children}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={`flex-shrink-0 ${s.icon} hover:opacity-70 transition-opacity`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
