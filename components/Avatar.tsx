import { ReactNode } from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  fallback?: ReactNode;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

/**
 * Avatar component with status indicator and fallback
 */
export function Avatar({
  src,
  alt = '',
  size = 'md',
  shape = 'circle',
  fallback,
  status,
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const statusColors = {
    online: 'bg-emerald-500',
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

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
          bg-stone-200 overflow-hidden flex items-center justify-center
        `}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : fallback ? (
          <span className="font-medium text-stone-600">{fallback}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-stone-400" />
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]} ${statusColors[status]}
            border-2 border-white rounded-full
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

/**
 * Avatar Group component
 */
export interface AvatarGroupProps {
  avatars: Array<Omit<AvatarProps, 'size'>>;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 5,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div key={index} className="ring-2 ring-white rounded-full">
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="ring-2 ring-white rounded-full">
          <Avatar size={size} fallback={`+${remainingCount}`} />
        </div>
      )}
    </div>
  );
}
