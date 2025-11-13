import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: 'text-blue-600',
      defaultIcon: Info,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: 'text-green-600',
      defaultIcon: CheckCircle,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: 'text-amber-600',
      defaultIcon: AlertCircle,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: 'text-red-600',
      defaultIcon: XCircle,
    },
  };

  const config = variants[variant];
  const Icon = icon || config.defaultIcon;

  return (
    <div className={`rounded-lg border p-4 ${config.container} ${className}`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${config.icon}`}>
          {typeof Icon === 'function' ? <Icon className="h-5 w-5" /> : Icon}
        </div>
        <div className="flex-1">
          {title && (
            <h5 className="font-semibold mb-1">{title}</h5>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.icon} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
