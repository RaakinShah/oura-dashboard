export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  className?: string;
}

export function Skeleton({
  width,
  height = '1rem',
  circle = false,
  count = 1,
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width,
    height,
  };

  const skeletonClass = `animate-pulse bg-stone-200 ${
    circle ? 'rounded-full' : 'rounded'
  } ${className}`;

  if (count === 1) {
    return <div className={skeletonClass} style={style} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${skeletonClass} mb-2`} style={style} />
      ))}
    </>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="0.75rem"
          width={index === lines - 1 ? '60%' : '100%'}
          className="mb-2"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 bg-white rounded-lg border border-stone-200 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton circle width="3rem" height="3rem" />
        <div className="flex-1">
          <Skeleton height="1rem" width="60%" className="mb-2" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}
