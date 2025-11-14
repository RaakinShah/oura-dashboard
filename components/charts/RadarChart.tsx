import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface RadarDataPoint {
  label: string;
  value: number;
  max?: number;
}

export interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  levels?: number;
  color?: string;
  fillOpacity?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
  className?: string;
}

export function RadarChart({
  data,
  size = 300,
  levels = 5,
  color = '#6366f1',
  fillOpacity = 0.3,
  showLabels = true,
  showValues = false,
  animate = true,
  className = '',
}: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 50;

  const { polygonPoints, maxValue, points } = useMemo(() => {
    if (!data.length) return { polygonPoints: '', maxValue: 0, points: [] };

    const maxValue = Math.max(...data.map((d) => d.max || d.value));
    const angleStep = (2 * Math.PI) / data.length;

    const points = data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const ratio = d.value / maxValue;
      const x = center + Math.cos(angle) * radius * ratio;
      const y = center + Math.sin(angle) * radius * ratio;
      const labelX = center + Math.cos(angle) * (radius + 30);
      const labelY = center + Math.sin(angle) * (radius + 30);

      return {
        x,
        y,
        labelX,
        labelY,
        label: d.label,
        value: d.value,
      };
    });

    const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

    return { polygonPoints, maxValue, points };
  }, [data, center, radius]);

  const angleStep = (2 * Math.PI) / data.length;

  return (
    <div className={`inline-block ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric circles (levels) */}
        <g className="text-stone-200">
          {Array.from({ length: levels }).map((_, i) => {
            const levelRadius = ((i + 1) / levels) * radius;
            const levelPoints = data
              .map((_, j) => {
                const angle = j * angleStep - Math.PI / 2;
                const x = center + Math.cos(angle) * levelRadius;
                const y = center + Math.sin(angle) * levelRadius;
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <polygon
                key={i}
                points={levelPoints}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
              />
            );
          })}
        </g>

        {/* Axes */}
        <g className="text-stone-300">
          {data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;

            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth={1}
              />
            );
          })}
        </g>

        {/* Data polygon */}
        <motion.polygon
          points={polygonPoints}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth={2}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: animate ? 1 : 0, opacity: animate ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={color}
            stroke="white"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: animate ? 1 : 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        ))}

        {/* Labels */}
        {showLabels && (
          <g className="text-xs text-stone-700 font-medium">
            {points.map((point, i) => (
              <text
                key={i}
                x={point.labelX}
                y={point.labelY}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="currentColor"
              >
                {point.label}
                {showValues && ` (${point.value})`}
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
