import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillArea?: boolean;
  showDots?: boolean;
  showCurrentValue?: boolean;
  showChange?: boolean;
  animate?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#6366f1',
  fillArea = false,
  showDots = false,
  showCurrentValue = false,
  showChange = false,
  animate = true,
  className = '',
}: SparklineProps) {
  const { pathD, areaD, currentValue, change, changePercent } = useMemo(() => {
    if (!data.length) return { pathD: '', areaD: '', currentValue: 0, change: 0, changePercent: 0 };

    const minY = Math.min(...data);
    const maxY = Math.max(...data);
    const range = maxY - minY || 1;

    const points = data.map((value, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - ((value - minY) / range) * height;
      return { x, y };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    const currentValue = data[data.length - 1];
    const previousValue = data[0];
    const change = currentValue - previousValue;
    const changePercent = (change / previousValue) * 100;

    return { pathD, areaD, currentValue, change, changePercent };
  }, [data, width, height]);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Area Fill */}
        {fillArea && (
          <motion.path
            d={areaD}
            fill={color}
            fillOpacity={0.2}
            initial={{ opacity: 0 }}
            animate={{ opacity: animate ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: animate ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        {/* Dots */}
        {showDots &&
          data.map((value, i) => {
            const minY = Math.min(...data);
            const maxY = Math.max(...data);
            const range = maxY - minY || 1;
            const x = (i / (data.length - 1 || 1)) * width;
            const y = height - ((value - minY) / range) * height;

            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={2}
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: animate ? 1 : 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              />
            );
          })}
      </svg>

      {/* Current Value */}
      {showCurrentValue && (
        <span className="text-sm font-semibold text-stone-900">
          {currentValue.toFixed(1)}
        </span>
      )}

      {/* Change Indicator */}
      {showChange && (
        <span
          className={`text-xs font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {changePercent.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
