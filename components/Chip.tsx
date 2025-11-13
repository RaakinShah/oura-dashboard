import { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ChipProps {
  children: ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: 'filled' | 'outlined';
  color?: 'default' | 'sage' | 'blue' | 'emerald' | 'amber' | 'red';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  avatar?: ReactNode;
  className?: string;
}

/**
 * Chip/Tag component for labels and filters
 */
export function Chip({
  children,
  onDelete,
  onClick,
  variant = 'filled',
  color = 'default',
  size = 'md',
  icon,
  avatar,
  className = '',
}: ChipProps) {
  const colorStyles = {
    filled: {
      default: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
      sage: 'bg-sage-100 text-sage-700 hover:bg-sage-200',
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
      amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      red: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
    outlined: {
      default: 'border-2 border-stone-300 text-stone-700 hover:bg-stone-50',
      sage: 'border-2 border-sage-300 text-sage-700 hover:bg-sage-50',
      blue: 'border-2 border-blue-300 text-blue-700 hover:bg-blue-50',
      emerald: 'border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50',
      amber: 'border-2 border-amber-300 text-amber-700 hover:bg-amber-50',
      red: 'border-2 border-red-300 text-red-700 hover:bg-red-50',
    },
  };

  const sizeClasses = {
    sm: 'h-6 text-xs px-2 gap-1',
    md: 'h-8 text-sm px-3 gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-full font-medium
        ${colorStyles[variant][color]}
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
        transition-colors
      `}
      onClick={onClick}
    >
      {avatar && <div className="flex-shrink-0">{avatar}</div>}
      {icon && <span className={`flex-shrink-0 ${iconSizes[size]}`}>{icon}</span>}
      <span className="truncate">{children}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-shrink-0 ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
}
