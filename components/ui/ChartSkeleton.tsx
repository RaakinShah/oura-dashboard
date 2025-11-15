import { motion } from 'framer-motion';

export interface ChartSkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'line' | 'bar' | 'pie' | 'scatter';
  className?: string;
}

export function ChartSkeleton({
  width = '100%',
  height = 400,
  variant = 'line',
  className = '',
}: ChartSkeletonProps) {
  return (
    <div
      className={`relative bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl overflow-hidden ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {/* Animated shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />

      {/* Chart-specific skeleton */}
      <div className="p-6 h-full flex flex-col">
        {/* Title skeleton */}
        <div className="mb-6">
          <div className="h-6 w-48 bg-stone-200/60 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-stone-200/40 rounded" />
        </div>

        {/* Chart skeleton based on variant */}
        <div className="flex-1 flex items-end justify-around gap-2">
          {variant === 'line' && (
            <svg width="100%" height="80%" className="overflow-visible">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={`${y}%`}
                  x2="100%"
                  y2={`${y}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-stone-200"
                  strokeDasharray="4,4"
                />
              ))}
              {/* Skeleton line path */}
              <motion.path
                d="M 0,60 L 20,45 L 40,55 L 60,35 L 80,50 L 100,40"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-stone-300"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </svg>
          )}

          {variant === 'bar' && (
            <>
              {[40, 65, 55, 80, 45, 70, 60, 85].map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-stone-300/60 rounded-t-lg"
                  style={{ height: `${height}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                />
              ))}
            </>
          )}

          {variant === 'pie' && (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="40"
                  className="text-stone-300/60"
                  strokeDasharray="150 350"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="40"
                  className="text-stone-300/40"
                  strokeDasharray="120 380"
                  transform="rotate(150 100 100)"
                />
              </svg>
            </div>
          )}

          {variant === 'scatter' && (
            <svg width="100%" height="80%" className="overflow-visible">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.circle
                  key={i}
                  cx={`${Math.random() * 90 + 5}%`}
                  cy={`${Math.random() * 80 + 10}%`}
                  r="4"
                  fill="currentColor"
                  className="text-stone-300/60"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                />
              ))}
            </svg>
          )}
        </div>

        {/* Legend skeleton */}
        <div className="mt-4 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-stone-300/60 rounded" />
              <div className="h-3 w-16 bg-stone-200/40 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 text-sm text-stone-500 font-medium">
          <motion.div
            className="w-2 h-2 bg-stone-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-stone-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-stone-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
          <span>Loading chart data...</span>
        </div>
      </div>
    </div>
  );
}
