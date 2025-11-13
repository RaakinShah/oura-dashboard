import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  className?: string;
}

/**
 * Alert/Banner component for important messages
 */
export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  className = '',
}: AlertProps) {
  const variantStyles = {
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-500',
      IconComponent: Info,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-900',
      icon: 'text-emerald-500',
      IconComponent: CheckCircle,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-900',
      icon: 'text-amber-500',
      IconComponent: AlertTriangle,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-900',
      icon: 'text-red-500',
      IconComponent: AlertCircle,
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = icon || <styles.IconComponent className="h-5 w-5" />;

  return (
    <div
      className={`
        ${styles.bg} ${styles.text}
        border rounded-lg p-4 flex gap-3
        ${className}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {IconComponent}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss alert"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
