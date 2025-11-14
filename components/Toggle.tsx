export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Toggle/Switch component
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className = '',
}: ToggleProps) {
  const sizeClasses = {
    sm: {
      switch: 'w-9 h-5',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-5 h-5',
      translate: 'translate-x-7',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`
            ${sizes.switch}
            ${checked ? 'bg-sage-600' : 'bg-stone-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            rounded-full transition-colors
            peer-focus:ring-2 peer-focus:ring-sage-500 peer-focus:ring-offset-2
          `}
        >
          <div
            className={`
              ${sizes.thumb}
              absolute top-1 left-1
              bg-white rounded-full
              transition-transform
              ${checked ? sizes.translate : 'translate-x-0'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm font-medium ${disabled ? 'text-stone-400' : 'text-stone-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
}
