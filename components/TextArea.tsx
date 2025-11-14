'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Enhanced textarea component with character count
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      hint,
      showCount,
      maxLength,
      resize = 'vertical',
      className = '',
      id,
      required,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    const currentLength = value ? String(value).length : 0;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-stone-700"
            >
              {label}
              {required && <span className="text-red-600 ml-1">*</span>}
            </label>
          )}

          {showCount && maxLength && (
            <span className="text-sm text-stone-500">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={`
            w-full px-4 py-3 rounded-lg border transition-all
            ${resizeClasses[resize]}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-stone-300 focus:ring-sage-500 focus:border-sage-500'}
            ${disabled ? 'bg-stone-100 cursor-not-allowed opacity-60' : 'bg-white'}
            focus:outline-none focus:ring-2
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          disabled={disabled}
          {...props}
        />

        {error && (
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p id={errorId} className="text-sm text-red-600" role="alert">
              {error}
            </p>
          </div>
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

TextArea.displayName = 'TextArea';
