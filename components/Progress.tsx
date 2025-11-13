export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  showLabel?: boolean;
  color?: 'sage' | 'blue' | 'emerald' | 'amber' | 'red';
  className?: string;
}

/**
 * Progress component with linear and circular variants
 */
export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  showLabel = false,
  color = 'sage',
  className = '',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    sage: 'bg-sage-600',
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
  };

  if (variant === 'circular') {
    const sizeMap = { sm: 48, md: 64, lg: 96 };
    const strokeWidthMap = { sm: 4, md: 6, lg: 8 };
    const circleSize = sizeMap[size];
    const strokeWidth = strokeWidthMap[size];
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg width={circleSize} height={circleSize} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-stone-200"
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${
              color === 'sage' ? 'text-sage-600' :
              color === 'blue' ? 'text-blue-600' :
              color === 'emerald' ? 'text-emerald-600' :
              color === 'amber' ? 'text-amber-600' :
              'text-red-600'
            }`}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-stone-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-stone-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-stone-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
