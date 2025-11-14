import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface DistributionPlotProps {
  data: number[];
  width?: number;
  height?: number;
  bins?: number;
  showKDE?: boolean;
  showBoxPlot?: boolean;
  showStats?: boolean;
  color?: string;
  title?: string;
  className?: string;
}

export function DistributionPlot({
  data,
  width = 600,
  height = 400,
  bins = 30,
  showKDE = true,
  showBoxPlot = true,
  showStats = true,
  color = '#6366f1',
  title,
  className = '',
}: DistributionPlotProps) {
  const padding = { top: 40, right: 40, bottom: showBoxPlot ? 100 : 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = (height - padding.top - padding.bottom) * (showBoxPlot ? 0.7 : 1);
  const boxPlotHeight = 40;

  const stats = useMemo(() => {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = sorted.reduce((a, b) => a + b, 0) / n;
    const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const q1 = sorted[Math.floor(n * 0.25)];
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const q3 = sorted[Math.floor(n * 0.75)];

    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
    const min = Math.min(...sorted);
    const max = Math.max(...sorted);

    return {
      mean,
      stdDev,
      variance,
      median,
      q1,
      q3,
      iqr,
      min,
      max,
      lowerFence,
      upperFence,
      outliers,
    };
  }, [data]);

  // Create histogram
  const histogram = useMemo(() => {
    const binWidth = (stats.max - stats.min) / bins;
    const binCounts = new Array(bins).fill(0);
    const binEdges: number[] = [];

    for (let i = 0; i <= bins; i++) {
      binEdges.push(stats.min + i * binWidth);
    }

    data.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - stats.min) / binWidth),
        bins - 1
      );
      binCounts[binIndex]++;
    });

    const maxCount = Math.max(...binCounts);

    return binCounts.map((count, i) => ({
      x: stats.min + i * binWidth,
      width: binWidth,
      height: (count / maxCount) * chartHeight,
      count,
    }));
  }, [data, bins, stats.min, stats.max, chartHeight]);

  // Kernel Density Estimation
  const kde = useMemo(() => {
    if (!showKDE) return [];

    const bandwidth = 1.06 * stats.stdDev * Math.pow(data.length, -1 / 5);
    const points: Array<{ x: number; y: number }> = [];

    for (let i = 0; i <= 100; i++) {
      const x = stats.min + (i / 100) * (stats.max - stats.min);
      let density = 0;

      data.forEach(val => {
        const u = (x - val) / bandwidth;
        density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
      });

      density = (density / data.length) / bandwidth;
      points.push({ x, y: density });
    }

    const maxDensity = Math.max(...points.map(p => p.y));
    return points.map(p => ({
      ...p,
      y: (p.y / maxDensity) * chartHeight,
    }));
  }, [data, showKDE, stats, chartHeight]);

  const kdePath = kde
    .map((p, i) => {
      const x = ((p.x - stats.min) / (stats.max - stats.min)) * chartWidth;
      const y = chartHeight - p.y;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-stone-900 mb-4">{title}</h3>
      )}

      <svg width={width} height={height}>
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Histogram */}
          {histogram.map((bar, i) => {
            const x = ((bar.x - stats.min) / (stats.max - stats.min)) * chartWidth;
            const barWidth = (bar.width / (stats.max - stats.min)) * chartWidth;

            return (
              <motion.rect
                key={i}
                x={x}
                y={chartHeight - bar.height}
                width={barWidth - 1}
                height={bar.height}
                fill={color}
                fillOpacity={0.6}
                initial={{ height: 0, y: chartHeight }}
                animate={{ height: bar.height, y: chartHeight - bar.height }}
                transition={{ delay: i * 0.01, duration: 0.3 }}
              >
                <title>{`${bar.x.toFixed(2)} - ${(bar.x + bar.width).toFixed(2)}: ${bar.count}`}</title>
              </motion.rect>
            );
          })}

          {/* KDE curve */}
          {showKDE && kde.length > 0 && (
            <motion.path
              d={kdePath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          )}

          {/* Mean line */}
          <g>
            <line
              x1={((stats.mean - stats.min) / (stats.max - stats.min)) * chartWidth}
              y1={0}
              x2={((stats.mean - stats.min) / (stats.max - stats.min)) * chartWidth}
              y2={chartHeight}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4,4"
            />
            <text
              x={((stats.mean - stats.min) / (stats.max - stats.min)) * chartWidth}
              y={-10}
              textAnchor="middle"
              className="text-xs font-semibold fill-red-600"
            >
              μ = {stats.mean.toFixed(2)}
            </text>
          </g>

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

          {/* X-axis labels */}
          <g className="text-xs text-stone-600">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = stats.min + ratio * (stats.max - stats.min);
              return (
                <text
                  key={ratio}
                  x={chartWidth * ratio}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {value.toFixed(1)}
                </text>
              );
            })}
          </g>

          {/* Box plot */}
          {showBoxPlot && (
            <g transform={`translate(0, ${chartHeight + 50})`}>
              {/* IQR box */}
              <rect
                x={((stats.q1 - stats.min) / (stats.max - stats.min)) * chartWidth}
                y={0}
                width={((stats.q3 - stats.q1) / (stats.max - stats.min)) * chartWidth}
                height={boxPlotHeight}
                fill={color}
                fillOpacity={0.3}
                stroke={color}
                strokeWidth={2}
              />

              {/* Median line */}
              <line
                x1={((stats.median - stats.min) / (stats.max - stats.min)) * chartWidth}
                y1={0}
                x2={((stats.median - stats.min) / (stats.max - stats.min)) * chartWidth}
                y2={boxPlotHeight}
                stroke={color}
                strokeWidth={3}
              />

              {/* Whiskers */}
              <line
                x1={((stats.lowerFence - stats.min) / (stats.max - stats.min)) * chartWidth}
                y1={boxPlotHeight / 2}
                x2={((stats.q1 - stats.min) / (stats.max - stats.min)) * chartWidth}
                y2={boxPlotHeight / 2}
                stroke={color}
                strokeWidth={2}
              />
              <line
                x1={((stats.q3 - stats.min) / (stats.max - stats.min)) * chartWidth}
                y1={boxPlotHeight / 2}
                x2={((stats.upperFence - stats.min) / (stats.max - stats.min)) * chartWidth}
                y2={boxPlotHeight / 2}
                stroke={color}
                strokeWidth={2}
              />

              {/* Fence markers */}
              <line
                x1={((stats.lowerFence - stats.min) / (stats.max - stats.min)) * chartWidth}
                y1={boxPlotHeight / 4}
                x2={((stats.lowerFence - stats.min) / (stats.max - stats.min)) * chartWidth}
                y2={(3 * boxPlotHeight) / 4}
                stroke={color}
                strokeWidth={2}
              />
              <line
                x1={((stats.upperFence - stats.min) / (stats.max - stats.min)) * chartWidth}
                y1={boxPlotHeight / 4}
                x2={((stats.upperFence - stats.min) / (stats.max - stats.min)) * chartWidth}
                y2={(3 * boxPlotHeight) / 4}
                stroke={color}
                strokeWidth={2}
              />

              {/* Outliers */}
              {stats.outliers.map((outlier, i) => (
                <circle
                  key={i}
                  cx={((outlier - stats.min) / (stats.max - stats.min)) * chartWidth}
                  cy={boxPlotHeight / 2}
                  r={3}
                  fill={color}
                />
              ))}
            </g>
          )}
        </g>
      </svg>

      {/* Statistics panel */}
      {showStats && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Mean', value: stats.mean.toFixed(2) },
            { label: 'Median', value: stats.median.toFixed(2) },
            { label: 'Std Dev', value: stats.stdDev.toFixed(2) },
            { label: 'IQR', value: stats.iqr.toFixed(2) },
          ].map((stat) => (
            <div key={stat.label} className="bg-stone-50 rounded-lg p-3">
              <div className="text-xs text-stone-600">{stat.label}</div>
              <div className="text-lg font-bold text-stone-900">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
