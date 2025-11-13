import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarDataPoint[];
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  showGrid?: boolean;
  showValues?: boolean;
  barColor?: string;
  animate?: boolean;
  className?: string;
}

export function BarChart({
  data,
  width = 400,
  height = 300,
  orientation = 'vertical',
  showGrid = true,
  showValues = false,
  barColor = '#6366f1',
  animate = true,
  className = '',
}: BarChartProps) {
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { maxValue, bars } = useMemo(() => {
    if (!data.length) return { maxValue: 0, bars: [] };

    const maxValue = Math.max(...data.map((d) => d.value));
    const barWidth = orientation === 'vertical'
      ? (chartWidth / data.length) * 0.7
      : chartHeight / data.length;
    const barGap = orientation === 'vertical'
      ? chartWidth / data.length
      : chartHeight / data.length;

    const bars = data.map((d, i) => {
      const barLength = (d.value / maxValue) * (orientation === 'vertical' ? chartHeight : chartWidth);

      return {
        label: d.label,
        value: d.value,
        color: d.color || barColor,
        x: orientation === 'vertical' ? i * barGap + (barGap - barWidth) / 2 : 0,
        y: orientation === 'vertical' ? chartHeight - barLength : i * barGap + (barGap - barWidth) / 2,
        width: orientation === 'vertical' ? barWidth : barLength,
        height: orientation === 'vertical' ? barLength : barWidth,
      };
    });

    return { maxValue, bars };
  }, [data, chartWidth, chartHeight, orientation, barColor]);

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid */}
          {showGrid && (
            <g className="text-stone-200">
              {orientation === 'vertical'
                ? [0, 0.25, 0.5, 0.75, 1].map((ratio) => (
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
                  ))
                : [0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <line
                      key={ratio}
                      x1={chartWidth * ratio}
                      y1={0}
                      x2={chartWidth * ratio}
                      y2={chartHeight}
                      stroke="currentColor"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                  ))}
            </g>
          )}

          {/* Bars */}
          {bars.map((bar, i) => (
            <g key={i}>
              <motion.rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={4}
                initial={
                  orientation === 'vertical'
                    ? { height: 0, y: chartHeight }
                    : { width: 0 }
                }
                animate={
                  animate
                    ? { height: bar.height, width: bar.width, y: bar.y }
                    : {}
                }
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
              />
              {showValues && (
                <motion.text
                  x={orientation === 'vertical' ? bar.x + bar.width / 2 : bar.x + bar.width + 5}
                  y={orientation === 'vertical' ? bar.y - 5 : bar.y + bar.height / 2}
                  textAnchor={orientation === 'vertical' ? 'middle' : 'start'}
                  alignmentBaseline={orientation === 'vertical' ? 'baseline' : 'middle'}
                  className="text-xs font-semibold fill-stone-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animate ? 1 : 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                >
                  {bar.value}
                </motion.text>
              )}
            </g>
          ))}

          {/* Axes */}
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

          {/* Labels */}
          <g className="text-xs text-stone-600">
            {bars.map((bar, i) => (
              <text
                key={i}
                x={orientation === 'vertical' ? bar.x + bar.width / 2 : -10}
                y={orientation === 'vertical' ? chartHeight + 20 : bar.y + bar.height / 2}
                textAnchor={orientation === 'vertical' ? 'middle' : 'end'}
                alignmentBaseline={orientation === 'vertical' ? 'hanging' : 'middle'}
                fill="currentColor"
                transform={
                  orientation === 'vertical'
                    ? `rotate(-45, ${bar.x + bar.width / 2}, ${chartHeight + 20})`
                    : ''
                }
              >
                {bar.label}
              </text>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
