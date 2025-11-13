import { useState } from 'react';
import { Star } from 'lucide-react';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  precision?: number;
  className?: string;
}

/**
 * Rating component with star display
 */
export function Rating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  precision = 1,
  className = '',
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      const newValue = index + 1;
      onChange(newValue === value ? 0 : newValue);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverValue(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const isFilled = index < displayValue;
          const isPartial =
            precision < 1 &&
            index < displayValue &&
            index + 1 > displayValue;
          const fillPercentage = isPartial
            ? ((displayValue - index) * 100).toFixed(0)
            : isFilled
            ? '100'
            : '0';

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={`
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                transition-transform
              `}
              aria-label={`Rate ${index + 1} out of ${max}`}
            >
              <div className="relative">
                <Star
                  className={`${sizeClasses[size]} text-stone-300`}
                  fill="currentColor"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={`${sizeClasses[size]} text-amber-400`}
                    fill="currentColor"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-stone-600">
          {value.toFixed(precision < 1 ? 1 : 0)} / {max}
        </span>
      )}
    </div>
  );
}
