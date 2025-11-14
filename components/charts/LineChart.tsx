import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface DataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showPoints?: boolean;
  showLabels?: boolean;
  color?: string;
  fillArea?: boolean;
  animate?: boolean;
  className?: string;
}

export function LineChart({
  data,
  width = 400,
  height = 200,
  showGrid = true,
  showAxes = true,
  showPoints = true,
  showLabels = false,
  color = '#6366f1',
  fillArea = false,
  animate = true,
  className = '',
}: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { minY, maxY, points, pathD, areaD } = useMemo(() => {
    if (!data.length) return { minY: 0, maxY: 0, points: [], pathD: '', areaD: '' };

    const yValues = data.map((d) => d.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const range = maxY - minY || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * chartWidth;
      const y = chartHeight - ((d.y - minY) / range) * chartHeight;
      return { x, y, label: d.label || String(d.x) };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return { minY, maxY, points, pathD, areaD };
  }, [data, chartWidth, chartHeight]);

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid */}
          {showGrid && (
            <g className="text-stone-200">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={0}
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              ))}
            </g>
          )}

          {/* Area Fill */}
          {fillArea && (
            <motion.path
              d={areaD}
              fill={color}
              fillOpacity={0.2}
              initial={{ opacity: 0 }}
              animate={{ opacity: animate ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animate ? 1 : 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Points */}
          {showPoints &&
            points.map((point, i) => (
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
                transition={{ delay: i * 0.05, duration: 0.3 }}
              />
            ))}

          {/* Axes */}
          {showAxes && (
            <g className="text-stone-400">
              <line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke="currentColor"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                stroke="currentColor"
                strokeWidth={1}
              />
            </g>
          )}

          {/* Labels */}
          {showLabels && (
            <g className="text-xs text-stone-600">
              {points.map((point, i) => (
                <text
                  key={i}
                  x={point.x}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {point.label}
                </text>
              ))}
              {[maxY, (maxY + minY) / 2, minY].map((value, i) => (
                <text
                  key={i}
                  x={-10}
                  y={chartHeight * (i / 2)}
                  textAnchor="end"
                  fill="currentColor"
                  alignmentBaseline="middle"
                >
                  {value.toFixed(0)}
                </text>
              ))}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
