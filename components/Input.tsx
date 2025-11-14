'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, Check } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  success?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

/**
 * Enhanced input component with validation states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      success,
      inputSize = 'md',
      className = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const sizeClasses = {
      sm: 'h-9 text-sm px-3',
      md: 'h-11 text-base px-4',
      lg: 'h-13 text-lg px-5',
    };

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full ${sizeClasses[inputSize]} rounded-lg border transition-all
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || error || success ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${success ? 'border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500' : ''}
              ${!error && !success ? 'border-stone-300 focus:ring-sage-500 focus:border-sage-500' : ''}
              ${disabled ? 'bg-stone-100 cursor-not-allowed opacity-60' : 'bg-white'}
              focus:outline-none focus:ring-2
            `}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
            disabled={disabled}
            {...props}
          />

          {(rightIcon || error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : success ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-stone-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
