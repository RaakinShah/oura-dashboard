import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface RadarDataPoint {
  axis: string;
  value: number;
  fullMark?: number;
}

export interface RadarSeries {
  name: string;
  data: RadarDataPoint[];
  color?: string;
}

export interface RadarChartProps {
  series: RadarSeries[];
  width?: number;
  height?: number;
  levels?: number;
  showDots?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  fillOpacity?: number;
  title?: string;
  className?: string;
}

export function RadarChart({
  series,
  width = 500,
  height = 500,
  levels = 5,
  showDots = true,
  showLabels = true,
  showLegend = true,
  fillOpacity = 0.2,
  title,
  className = '',
}: RadarChartProps) {
  const padding = 80;
  const radius = Math.min(width, height) / 2 - padding;
  const centerX = width / 2;
  const centerY = height / 2;

  const defaultColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const { axes, maxValue, seriesData } = useMemo(() => {
    if (series.length === 0 || series[0].data.length === 0) {
      return { axes: [], maxValue: 100, seriesData: [] };
    }

    const axes = series[0].data.map(d => d.axis);
    const numAxes = axes.length;

    const allValues = series.flatMap(s => s.data.map(d => d.value));
    const dataMax = Math.max(...allValues);
    const fullMarks = series[0].data.map(d => d.fullMark || 100);
    const fullMarkMax = Math.max(...fullMarks);
    const maxValue = Math.max(dataMax, fullMarkMax);

    const seriesData = series.map((s, seriesIndex) => {
      const color = s.color || defaultColors[seriesIndex % defaultColors.length];

      const points = s.data.map((point, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const value = (point.value / maxValue) * radius;
        const x = centerX + value * Math.cos(angle);
        const y = centerY + value * Math.sin(angle);

        return { x, y, value: point.value, angle };
      });

      const pathD = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ') + ' Z';

      return {
        name: s.name,
        color,
        points,
        pathD,
      };
    });

    return { axes, maxValue, seriesData };
  }, [series, radius, centerX, centerY]);

  const numAxes = axes.length;

  const levelCircles = Array.from({ length: levels }, (_, i) => {
    const levelRadius = (radius * (i + 1)) / levels;
    const levelValue = (maxValue * (i + 1)) / levels;
    return { radius: levelRadius, value: levelValue };
  });

  return (
    <div className={`relative ${className}`}>
      {title && <h3 className="text-lg font-semibold text-stone-900 mb-4">{title}</h3>}

      <svg width={width} height={height} className="overflow-visible">
        <g className="text-stone-200">
          {levelCircles.map((level, i) => (
            <g key={i}>
              <circle
                cx={centerX}
                cy={centerY}
                r={level.radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
              {i === levels - 1 && (
                <text
                  x={centerX + 5}
                  y={centerY - level.radius}
                  className="text-xs fill-stone-400"
                >
                  {level.value.toFixed(0)}
                </text>
              )}
            </g>
          ))}
        </g>

        <g className="text-stone-300">
          {axes.map((axis, i) => {
            const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const labelRadius = radius + 30;
            const labelX = centerX + labelRadius * Math.cos(angle);
            const labelY = centerY + labelRadius * Math.sin(angle);

            return (
              <g key={i}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                {showLabels && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="text-sm font-medium fill-stone-700"
                  >
                    {axis}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {seriesData.map((series, seriesIndex) => (
          <g key={seriesIndex}>
            <motion.path
              d={series.pathD}
              fill={series.color}
              fillOpacity={fillOpacity}
              stroke={series.color}
              strokeWidth={2}
              strokeLinejoin="round"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: seriesIndex * 0.1, duration: 0.5 }}
              style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            />

            {showDots && series.points.map((point, i) => (
              <motion.circle
                key={i}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={series.color}
                stroke="white"
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: seriesIndex * 0.1 + i * 0.05, duration: 0.3 }}
                className="cursor-pointer"
              >
                <title>
                  {series.name} - {axes[i]}: {point.value.toFixed(2)}
                </title>
              </motion.circle>
            ))}
          </g>
        ))}
      </svg>

      {showLegend && seriesData.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {seriesData.map((series, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: series.color }}
              />
              <span className="text-sm text-stone-700">{series.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
