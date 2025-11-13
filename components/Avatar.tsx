import { ReactNode } from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-stone-200 text-stone-600 ${sizes[size]} ${className}`}
    >
      {fallback || <User className="w-1/2 h-1/2" />}
    </div>
  );
}

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  className?: string;
}

export function AvatarGroup({ children, max, className = '' }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const displayChildren = max ? childArray.slice(0, max) : childArray;
  const remaining = max && childArray.length > max ? childArray.length - max : 0;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayChildren}
      {remaining > 0 && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-200 text-stone-600 text-sm font-medium border-2 border-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}
