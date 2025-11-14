'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  checkboxSize?: 'sm' | 'md' | 'lg';
}

/**
 * Enhanced checkbox component with indeterminate state
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      indeterminate,
      checkboxSize = 'md',
      className = '',
      id,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    return (
      <div className={className}>
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`
                ${sizeClasses[checkboxSize]} rounded border-2 flex items-center justify-center
                transition-all cursor-pointer
                ${error ? 'border-red-500' : 'border-stone-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                peer-checked:bg-sage-600 peer-checked:border-sage-600
                peer-focus:ring-2 peer-focus:ring-sage-500 peer-focus:ring-offset-2
                hover:border-sage-400
              `}
            >
              {checked && !indeterminate && (
                <Check className={`${iconSizes[checkboxSize]} text-white`} />
              )}
              {indeterminate && (
                <Minus className={`${iconSizes[checkboxSize]} text-white`} />
              )}
            </div>
          </div>

          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className={`block text-sm font-medium cursor-pointer ${
                    disabled ? 'text-stone-400' : 'text-stone-900'
                  }`}
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-sm text-stone-500 mt-0.5">{description}</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 ml-8 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
