import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface HeatMapDataPoint {
  x: number | string;
  y: number | string;
  value: number;
}

export interface HeatMapProps {
  data: HeatMapDataPoint[];
  width?: number;
  height?: number;
  cellSize?: number;
  gap?: number;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'custom';
  customColors?: string[];
  showValues?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  className?: string;
}

export function HeatMap({
  data,
  width = 400,
  height = 300,
  cellSize = 40,
  gap = 2,
  colorScheme = 'blue',
  customColors,
  showValues = false,
  showLegend = true,
  animate = true,
  className = '',
}: HeatMapProps) {
  const colorSchemes = {
    blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
    green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
    red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
    purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce'],
    custom: customColors || [],
  };

  const colors = colorSchemes[colorScheme];

  const { minValue, maxValue, xLabels, yLabels, cells } = useMemo(() => {
    if (!data.length) return { minValue: 0, maxValue: 0, xLabels: [], yLabels: [], cells: [] };

    const values = data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const xLabels = Array.from(new Set(data.map((d) => String(d.x))));
    const yLabels = Array.from(new Set(data.map((d) => String(d.y))));

    const cells = data.map((d) => {
      const xIndex = xLabels.indexOf(String(d.x));
      const yIndex = yLabels.indexOf(String(d.y));
      const ratio = (d.value - minValue) / range;
      const colorIndex = Math.min(Math.floor(ratio * colors.length), colors.length - 1);

      return {
        x: xIndex * (cellSize + gap),
        y: yIndex * (cellSize + gap),
        value: d.value,
        color: colors[colorIndex],
        label: `${d.x}, ${d.y}: ${d.value}`,
      };
    });

    return { minValue, maxValue, xLabels, yLabels, cells };
  }, [data, cellSize, gap, colors]);

  const totalWidth = xLabels.length * (cellSize + gap);
  const totalHeight = yLabels.length * (cellSize + gap);

  return (
    <div className={`${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <g transform="translate(60, 40)">
          {/* Cells */}
          {cells.map((cell, i) => (
            <g key={i}>
              <motion.rect
                x={cell.x}
                y={cell.y}
                width={cellSize}
                height={cellSize}
                fill={cell.color}
                rx={4}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: animate ? 1 : 0, opacity: animate ? 1 : 0 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                className="cursor-pointer hover:stroke-stone-900 hover:stroke-2"
              >
                <title>{cell.label}</title>
              </motion.rect>
              {showValues && (
                <motion.text
                  x={cell.x + cellSize / 2}
                  y={cell.y + cellSize / 2}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-xs font-semibold fill-stone-700 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animate ? 1 : 0 }}
                  transition={{ delay: i * 0.02 + 0.3 }}
                >
                  {cell.value}
                </motion.text>
              )}
            </g>
          ))}

          {/* X Labels */}
          <g className="text-xs text-stone-600">
            {xLabels.map((label, i) => (
              <text
                key={i}
                x={i * (cellSize + gap) + cellSize / 2}
                y={-10}
                textAnchor="middle"
                fill="currentColor"
              >
                {label}
              </text>
            ))}
          </g>

          {/* Y Labels */}
          <g className="text-xs text-stone-600">
            {yLabels.map((label, i) => (
              <text
                key={i}
                x={-10}
                y={i * (cellSize + gap) + cellSize / 2}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="currentColor"
              >
                {label}
              </text>
            ))}
          </g>
        </g>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-stone-600">{minValue}</span>
          <div className="flex gap-1">
            {colors.map((color, i) => (
              <div
                key={i}
                className="w-8 h-4 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-stone-600">{maxValue}</span>
        </div>
      )}
    </div>
  );
}
