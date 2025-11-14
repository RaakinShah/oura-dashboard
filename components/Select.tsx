import { SelectHTMLAttributes, ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  selectSize?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  options,
  selectSize = 'md',
  placeholder,
  className = '',
  ...props
}: SelectProps) {
  const sizes = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        className={`
          w-full px-3 rounded-lg border transition-colors
          ${sizes[selectSize]}
          ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
              : 'border-stone-300 focus:border-sage-600 focus:ring-sage-200'
          }
          focus:outline-none focus:ring-2
          disabled:bg-stone-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {hint && !error && (
        <p className="mt-1 text-sm text-stone-500">{hint}</p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
