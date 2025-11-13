import { ReactNode } from 'react';
import { Inbox, Search, AlertCircle, FileQuestion } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'error' | 'info';
  className?: string;
}

/**
 * Empty state component for no data scenarios
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const variantIcons = {
    default: <Inbox className="h-16 w-16" />,
    search: <Search className="h-16 w-16" />,
    error: <AlertCircle className="h-16 w-16" />,
    info: <FileQuestion className="h-16 w-16" />,
  };

  const variantColors = {
    default: 'text-stone-400',
    search: 'text-blue-400',
    error: 'text-red-400',
    info: 'text-amber-400',
  };

  const displayIcon = icon || variantIcons[variant];

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      <div className={`mb-4 ${variantColors[variant]}`}>
        {displayIcon}
      </div>

      <h3 className="text-lg font-semibold text-stone-900 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-stone-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="btn-refined btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
