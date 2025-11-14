import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface ViolinPlotProps {
  data: number[][];
  labels?: string[];
  width?: number;
  height?: number;
  colors?: string[];
  showBoxPlot?: boolean;
  showMedian?: boolean;
  showMean?: boolean;
  bandwidth?: number;
  title?: string;
  className?: string;
}

export function ViolinPlot({
  data,
  labels,
  width = 600,
  height = 400,
  colors,
  showBoxPlot = true,
  showMedian = true,
  showMean = false,
  bandwidth,
  title,
  className = '',
}: ViolinPlotProps) {
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const defaultColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  const violinColors = colors || defaultColors;

  const violins = useMemo(() => {
    const globalMin = Math.min(...data.flat());
    const globalMax = Math.max(...data.flat());
    const range = globalMax - globalMin || 1;

    return data.map((values, groupIndex) => {
      const sorted = [...values].sort((a, b) => a - b);
      const n = sorted.length;

      // Calculate statistics
      const mean = sorted.reduce((a, b) => a + b, 0) / n;
      const median = n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];
      const q1 = sorted[Math.floor(n * 0.25)];
      const q3 = sorted[Math.floor(n * 0.75)];
      const min = sorted[0];
      const max = sorted[n - 1];

      // Kernel Density Estimation
      const bw = bandwidth || 1.06 * Math.sqrt(sorted.reduce((sum, val) =>
        sum + Math.pow(val - mean, 2), 0) / n) * Math.pow(n, -1 / 5);

      const densityPoints: Array<{ value: number; density: number }> = [];
      const steps = 50;

      for (let i = 0; i <= steps; i++) {
        const value = min + (i / steps) * (max - min);
        let density = 0;

        sorted.forEach(val => {
          const u = (value - val) / bw;
          density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
        });

        density = (density / n) / bw;
        densityPoints.push({ value, density });
      }

      const maxDensity = Math.max(...densityPoints.map(p => p.density));
      const violinWidth = chartWidth / (data.length * 2);

      // Create violin path
      const leftPath = densityPoints.map(p => {
        const x = groupIndex * (chartWidth / data.length) + chartWidth / (data.length * 2);
        const y = chartHeight - ((p.value - globalMin) / range) * chartHeight;
        const offset = (p.density / maxDensity) * violinWidth;
        return `${x - offset},${y}`;
      }).join(' ');

      const rightPath = densityPoints.reverse().map(p => {
        const x = groupIndex * (chartWidth / data.length) + chartWidth / (data.length * 2);
        const y = chartHeight - ((p.value - globalMin) / range) * chartHeight;
        const offset = (p.density / maxDensity) * violinWidth;
        return `${x + offset},${y}`;
      }).join(' ');

      const pathD = `M ${leftPath} L ${rightPath} Z`;

      return {
        pathD,
        mean,
        median,
        q1,
        q3,
        min,
        max,
        x: groupIndex * (chartWidth / data.length) + chartWidth / (data.length * 2),
        boxWidth: violinWidth * 0.3,
        color: violinColors[groupIndex % violinColors.length],
        globalMin,
        range,
      };
    });
  }, [data, chartWidth, chartHeight, bandwidth, violinColors]);

  return (
    <div className={`relative ${className}`}>
      {title && <h3 className="text-lg font-semibold text-stone-900 mb-4">{title}</h3>}

      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Violins */}
          {violins.map((violin, i) => (
            <g key={i}>
              {/* Violin shape */}
              <motion.path
                d={violin.pathD}
                fill={violin.color}
                fillOpacity={0.3}
                stroke={violin.color}
                strokeWidth={2}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ transformOrigin: `${violin.x}px ${chartHeight}px` }}
              />

              {/* Box plot */}
              {showBoxPlot && (
                <g>
                  {/* IQR box */}
                  <rect
                    x={violin.x - violin.boxWidth / 2}
                    y={chartHeight - ((violin.q3 - violin.globalMin) / violin.range) * chartHeight}
                    width={violin.boxWidth}
                    height={
                      ((violin.q3 - violin.q1) / violin.range) * chartHeight
                    }
                    fill="white"
                    stroke={violin.color}
                    strokeWidth={2}
                  />

                  {/* Median line */}
                  {showMedian && (
                    <line
                      x1={violin.x - violin.boxWidth / 2}
                      y1={chartHeight - ((violin.median - violin.globalMin) / violin.range) * chartHeight}
                      x2={violin.x + violin.boxWidth / 2}
                      y2={chartHeight - ((violin.median - violin.globalMin) / violin.range) * chartHeight}
                      stroke={violin.color}
                      strokeWidth={3}
                    />
                  )}

                  {/* Whiskers */}
                  <line
                    x1={violin.x}
                    y1={chartHeight - ((violin.q1 - violin.globalMin) / violin.range) * chartHeight}
                    x2={violin.x}
                    y2={chartHeight - ((violin.min - violin.globalMin) / violin.range) * chartHeight}
                    stroke={violin.color}
                    strokeWidth={1.5}
                  />
                  <line
                    x1={violin.x}
                    y1={chartHeight - ((violin.q3 - violin.globalMin) / violin.range) * chartHeight}
                    x2={violin.x}
                    y2={chartHeight - ((violin.max - violin.globalMin) / violin.range) * chartHeight}
                    stroke={violin.color}
                    strokeWidth={1.5}
                  />
                </g>
              )}

              {/* Mean marker */}
              {showMean && (
                <circle
                  cx={violin.x}
                  cy={chartHeight - ((violin.mean - violin.globalMin) / violin.range) * chartHeight}
                  r={4}
                  fill={violin.color}
                  stroke="white"
                  strokeWidth={2}
                />
              )}
            </g>
          ))}

          {/* Axes */}
          <g className="text-stone-600">
            <line
              x1={0}
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="currentColor"
              strokeWidth={2}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={chartHeight}
              stroke="currentColor"
              strokeWidth={2}
            />
          </g>

          {/* Labels */}
          <g className="text-sm text-stone-700">
            {violins.map((violin, i) => (
              <text
                key={i}
                x={violin.x}
                y={chartHeight + 25}
                textAnchor="middle"
                fill="currentColor"
              >
                {labels?.[i] || `Group ${i + 1}`}
              </text>
            ))}
          </g>

          {/* Y-axis labels */}
          <g className="text-xs text-stone-600">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = violins[0].globalMin + ratio * violins[0].range;
              return (
                <text
                  key={ratio}
                  x={-10}
                  y={chartHeight - chartHeight * ratio}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fill="currentColor"
                >
                  {value.toFixed(1)}
                </text>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Statistics summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {violins.map((violin, i) => (
          <div key={i} className="p-3 bg-stone-50 rounded-lg border" style={{ borderColor: violin.color }}>
            <div className="font-semibold text-stone-900 mb-2">
              {labels?.[i] || `Group ${i + 1}`}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-600">Median:</span>
                <span className="ml-2 font-semibold">{violin.median.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-stone-600">Mean:</span>
                <span className="ml-2 font-semibold">{violin.mean.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-stone-600">Q1:</span>
                <span className="ml-2 font-semibold">{violin.q1.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-stone-600">Q3:</span>
                <span className="ml-2 font-semibold">{violin.q3.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
