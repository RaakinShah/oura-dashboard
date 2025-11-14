import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  children,
  variant = 'default',
  title,
  onClose,
  className = '',
}: AlertProps) {
  const variants = {
    default: {
      container: 'bg-stone-50 border-stone-200 text-stone-900',
      icon: <Info className="w-5 h-5 text-stone-600" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    },
    danger: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  };

  const { container, icon } = variants[variant];

  return (
    <div
      className={`relative flex gap-3 p-4 border rounded-lg ${container} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
