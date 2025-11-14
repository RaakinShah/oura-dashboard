import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  isLoading?: boolean;
  autoFocus?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Enhanced search input component
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  isLoading = false,
  autoFocus = false,
  clearable = true,
  size = 'md',
  className = '',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-13 text-lg',
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
        <Search className="h-5 w-5" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          w-full ${sizeClasses[size]} pl-10 pr-10
          border border-stone-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500
          placeholder:text-stone-400
          transition-all
        `}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-stone-400 animate-spin" />
        ) : clearable && value ? (
          <button
            onClick={handleClear}
            className="text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
