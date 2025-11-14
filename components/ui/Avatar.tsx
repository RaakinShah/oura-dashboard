import { ReactNode } from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string | ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  border?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  border = false,
  className = '',
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-stone-400',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizes[size]} ${shapes[shape]} ${
          border ? 'ring-2 ring-white ring-offset-2' : ''
        } overflow-hidden bg-stone-200 flex items-center justify-center`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="font-semibold text-stone-600">
            {typeof fallback === 'string' ? getInitials(fallback) : fallback || '?'}
          </div>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} border-2 border-white rounded-full`}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const displayChildren = childrenArray.slice(0, max);
  const remaining = childrenArray.length - max;

  const overlapClasses = '-space-x-2';

  return (
    <div className={`flex items-center ${overlapClasses} ${className}`}>
      {displayChildren}
      {remaining > 0 && (
        <Avatar
          fallback={`+${remaining}`}
          size={size}
          className="ring-2 ring-white"
        />
      )}
    </div>
  );
}
