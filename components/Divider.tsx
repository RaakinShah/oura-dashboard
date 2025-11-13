import { ReactNode } from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Divider component for visual separation
 */
export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  label,
  labelPosition = 'center',
  className = '',
}: DividerProps) {
  const variantStyles = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={`border-l ${variantStyles[variant]} border-stone-200 h-full ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    const positionClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        className={`flex items-center ${positionClasses[labelPosition]} ${className}`}
        role="separator"
      >
        {labelPosition !== 'left' && (
          <div className={`flex-1 border-t ${variantStyles[variant]} border-stone-200`} />
        )}
        <span className="px-3 text-sm text-stone-500 font-medium">{label}</span>
        {labelPosition !== 'right' && (
          <div className={`flex-1 border-t ${variantStyles[variant]} border-stone-200`} />
        )}
      </div>
    );
  }

  return (
    <div
      className={`border-t ${variantStyles[variant]} border-stone-200 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
