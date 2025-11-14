'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  radioSize?: 'sm' | 'md' | 'lg';
}

/**
 * Radio button component
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      radioSize = 'md',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              ${sizeClasses[radioSize]} rounded-full border-2 border-stone-300
              flex items-center justify-center transition-all cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              peer-checked:border-sage-600
              peer-focus:ring-2 peer-focus:ring-sage-500 peer-focus:ring-offset-2
              hover:border-sage-400
            `}
          >
            <div className="w-1/2 h-1/2 rounded-full bg-sage-600 scale-0 peer-checked:scale-100 transition-transform" />
          </div>
        </div>

        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={radioId}
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
    );
  }
);

Radio.displayName = 'Radio';

/**
 * Radio Group component
 */
export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: ReactNode;
    description?: string;
    disabled?: boolean;
  }>;
  label?: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  label,
  error,
  orientation = 'vertical',
  className = '',
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-3">
          {label}
        </label>
      )}

      <div
        className={`
          ${orientation === 'vertical' ? 'space-y-3' : 'flex flex-wrap gap-6'}
        `}
        role="radiogroup"
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
          />
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
