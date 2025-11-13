import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  showMinMax?: boolean;
  label?: string;
  segments?: number;
  animate?: boolean;
  className?: string;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 200,
  thickness = 20,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  showValue = true,
  showMinMax = false,
  label,
  segments = 0,
  animate = true,
  className = '',
}: GaugeChartProps) {
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = Math.PI * radius;

  const { percentage, offset, displayValue } = useMemo(() => {
    const clampedValue = Math.max(min, Math.min(max, value));
    const percentage = ((clampedValue - min) / (max - min)) * 100;
    const offset = circumference - (percentage / 100) * circumference;
    const displayValue = clampedValue.toFixed(0);

    return { percentage, offset, displayValue };
  }, [value, min, max, circumference]);

  const startAngle = -180;
  const endAngle = 0;

  const polarToCartesian = (angle: number, r: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + r * Math.cos(angleInRadians),
      y: center + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(endAngle, radius);
    const end = polarToCartesian(startAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const backgroundPath = describeArc(startAngle, endAngle);
  const valuePath = describeArc(startAngle, startAngle + (endAngle - startAngle) * (percentage / 100));

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size / 1.5} className="overflow-visible">
        <g transform={`translate(0, ${size / 6})`}>
          {/* Background arc */}
          <path
            d={backgroundPath}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={thickness}
            strokeLinecap="round"
          />

          {/* Segments */}
          {segments > 0 &&
            Array.from({ length: segments - 1 }).map((_, i) => {
              const segmentAngle = startAngle + ((i + 1) / segments) * (endAngle - startAngle);
              const point = polarToCartesian(segmentAngle, radius);

              return (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={thickness / 4}
                  fill="white"
                />
              );
            })}

          {/* Value arc */}
          <motion.path
            d={valuePath}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animate ? 1 : 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Center value */}
          {showValue && (
            <g>
              <motion.text
                x={center}
                y={center}
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-4xl font-bold fill-stone-900"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: animate ? 1 : 0, scale: animate ? 1 : 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {displayValue}
              </motion.text>
              {label && (
                <text
                  x={center}
                  y={center + 25}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-sm fill-stone-600"
                >
                  {label}
                </text>
              )}
            </g>
          )}

          {/* Min/Max labels */}
          {showMinMax && (
            <g className="text-xs fill-stone-600">
              <text
                x={polarToCartesian(startAngle, radius + thickness).x}
                y={polarToCartesian(startAngle, radius + thickness).y + 15}
                textAnchor="start"
              >
                {min}
              </text>
              <text
                x={polarToCartesian(endAngle, radius + thickness).x}
                y={polarToCartesian(endAngle, radius + thickness).y + 15}
                textAnchor="end"
              >
                {max}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
