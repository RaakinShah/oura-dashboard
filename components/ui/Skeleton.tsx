import { motion } from 'framer-motion';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
}: SkeletonProps) {
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: '',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (animation === 'wave') {
    return (
      <div
        className={`bg-stone-200 overflow-hidden relative ${variants[variant]} ${className}`}
        style={style}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-stone-200 ${variants[variant]} ${animations[animation]} ${className}`}
      style={style}
    />
  );
}

export interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  showAvatar = false,
  showImage = false,
  className = '',
}: SkeletonCardProps) {
  return (
    <div className={`p-6 bg-white rounded-lg border border-stone-200 ${className}`}>
      {showImage && <Skeleton variant="rectangular" height={200} className="mb-4" />}

      <div className="flex items-center gap-3 mb-4">
        {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
        <div className="flex-1">
          <Skeleton width="60%" className="mb-2" />
          <Skeleton width="40%" height={12} />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '70%' : '100%'}
          />
        ))}
      </div>
    </div>
  );
}
