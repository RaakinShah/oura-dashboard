import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showPercentages?: boolean;
  centerLabel?: string;
  centerValue?: string;
  animate?: boolean;
  className?: string;
}

export function DonutChart({
  data,
  size = 200,
  thickness = 30,
  showLabels = false,
  showLegend = true,
  showPercentages = true,
  centerLabel,
  centerValue,
  animate = true,
  className = '',
}: DonutChartProps) {
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const innerRadius = radius - thickness;

  const defaultColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
    '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  ];

  const { segments, total } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -90;

    const segments = data.map((d, i) => {
      const percentage = (d.value / total) * 100;
      const angle = (d.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle += angle;

      const largeArcFlag = angle > 180 ? 1 : 0;

      const startX = center + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = center + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);

      const innerStartX = center + innerRadius * Math.cos((startAngle * Math.PI) / 180);
      const innerStartY = center + innerRadius * Math.sin((startAngle * Math.PI) / 180);
      const innerEndX = center + innerRadius * Math.cos((endAngle * Math.PI) / 180);
      const innerEndY = center + innerRadius * Math.sin((endAngle * Math.PI) / 180);

      const pathD = [
        `M ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        `L ${innerEndX} ${innerEndY}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
        'Z',
      ].join(' ');

      return {
        label: d.label,
        value: d.value,
        percentage,
        color: d.color || defaultColors[i % defaultColors.length],
        pathD,
        startAngle,
        angle,
      };
    });

    return { segments, total };
  }, [data, center, radius, innerRadius, defaultColors]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative inline-block">
        <svg width={size} height={size} className="overflow-visible">
          {segments.map((segment, i) => (
            <g key={i}>
              <motion.path
                d={segment.pathD}
                fill={segment.color}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: animate ? 1 : 0, scale: animate ? 1 : 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                style={{ transformOrigin: `${center}px ${center}px` }}
                className="hover:opacity-80 cursor-pointer transition-opacity"
              >
                <title>
                  {segment.label}: {segment.value} ({segment.percentage.toFixed(1)}%)
                </title>
              </motion.path>
            </g>
          ))}

          {showLabels &&
            segments.map((segment, i) => {
              const labelAngle = segment.startAngle + segment.angle / 2;
              const labelRadius = (radius + innerRadius) / 2;
              const labelX = center + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
              const labelY = center + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

              if (segment.angle < 15) return null;

              return (
                <motion.text
                  key={i}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-xs font-semibold fill-white pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animate ? 1 : 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                >
                  {showPercentages ? `${segment.percentage.toFixed(0)}%` : segment.value}
                </motion.text>
              );
            })}
        </svg>

        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && (
              <div className="text-3xl font-bold text-stone-900">{centerValue}</div>
            )}
            {centerLabel && (
              <div className="text-sm text-stone-600">{centerLabel}</div>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-3 justify-center">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-stone-700">
                {segment.label}
                {showPercentages && ` (${segment.percentage.toFixed(1)}%)`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
