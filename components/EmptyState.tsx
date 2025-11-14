import { ReactNode, ComponentType } from 'react';
import Link from 'next/link';
import { Inbox, Search, AlertCircle, FileQuestion, LucideProps } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode | ComponentType<LucideProps>;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
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

  // Handle icon as either a ReactNode or a component type
  const displayIcon = icon
    ? (typeof icon === 'function' ? (() => {
        const IconComponent = icon as ComponentType<LucideProps>;
        return <IconComponent className="h-16 w-16" />;
      })() : icon)
    : variantIcons[variant];

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
        action.href ? (
          <Link
            href={action.href}
            className="btn-refined btn-primary"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="btn-refined btn-primary"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
