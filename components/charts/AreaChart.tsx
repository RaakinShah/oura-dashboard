import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

export interface AreaDataPoint {
  x: number;
  y: number;
  label?: string;
}

export interface AreaSeries {
  name: string;
  data: AreaDataPoint[];
  color?: string;
  fillOpacity?: number;
}

export interface AreaChartProps {
  series: AreaSeries[];
  width?: number;
  height?: number;
  stacked?: boolean;
  showDots?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  curveType?: 'linear' | 'smooth';
  xLabel?: string;
  yLabel?: string;
  title?: string;
  className?: string;
}

export function AreaChart({
  series,
  width = 800,
  height = 400,
  stacked = false,
  showDots = false,
  showGrid = true,
  showLegend = true,
  curveType = 'smooth',
  xLabel,
  yLabel,
  title,
  className = '',
}: AreaChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);

  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const defaultColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const { processedSeries, xDomain, yDomain } = useMemo(() => {
    if (series.length === 0 || series[0].data.length === 0) {
      return { processedSeries: [], xDomain: [0, 1], yDomain: [0, 1] };
    }

    // Find domains
    const allX = series.flatMap(s => s.data.map(d => d.x));
    const xMin = Math.min(...allX);
    const xMax = Math.max(...allX);
    const xDomain = [xMin, xMax];

    let yMax: number;
    if (stacked) {
      // For stacked, sum y values at each x
      const xPoints = Array.from(new Set(allX)).sort((a, b) => a - b);
      const stackedSums = xPoints.map(x => {
        return series.reduce((sum, s) => {
          const point = s.data.find(d => d.x === x);
          return sum + (point?.y || 0);
        }, 0);
      });
      yMax = Math.max(...stackedSums);
    } else {
      const allY = series.flatMap(s => s.data.map(d => d.y));
      yMax = Math.max(...allY);
    }
    const yDomain = [0, yMax * 1.1];

    // Process each series
    let cumulativeY: Map<number, number> = new Map();

    const processedSeries = series.map((s, seriesIndex) => {
      const color = s.color || defaultColors[seriesIndex % defaultColors.length];
      const fillOpacity = s.fillOpacity ?? 0.3;

      const points = s.data.map(point => {
        const x = ((point.x - xDomain[0]) / (xDomain[1] - xDomain[0])) * chartWidth;
        let y = point.y;

        // For stacked charts, add cumulative y
        if (stacked) {
          const prevY = cumulativeY.get(point.x) || 0;
          y = prevY + point.y;
          cumulativeY.set(point.x, y);
        }

        const chartY = chartHeight - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight;

        return { ...point, chartX: x, chartY, stackedY: y };
      });

      // Create line path
      let linePath = '';
      let areaPath = '';

      if (curveType === 'smooth') {
        // Catmull-Rom spline for smooth curves
        const controlPoints = points.map((p, i) => {
          if (i === 0 || i === points.length - 1) return null;
          const prev = points[i - 1];
          const next = points[i + 1];
          return {
            cp1x: p.chartX - (next.chartX - prev.chartX) / 6,
            cp1y: p.chartY - (next.chartY - prev.chartY) / 6,
            cp2x: p.chartX + (next.chartX - prev.chartX) / 6,
            cp2y: p.chartY + (next.chartY - prev.chartY) / 6,
          };
        });

        linePath = points.map((p, i) => {
          if (i === 0) return `M ${p.chartX} ${p.chartY}`;
          if (curveType === 'smooth' && i > 0 && controlPoints[i - 1]) {
            const cp = controlPoints[i - 1]!;
            return `C ${cp.cp2x} ${cp.cp2y}, ${p.chartX - (points[i].chartX - points[i - 1].chartX) / 6} ${p.chartY}, ${p.chartX} ${p.chartY}`;
          }
          return `L ${p.chartX} ${p.chartY}`;
        }).join(' ');
      } else {
        linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.chartX} ${p.chartY}`).join(' ');
      }

      // Create area path (close to baseline)
      const baseline = stacked && seriesIndex > 0
        ? processedSeries[seriesIndex - 1].points.map(p => `${p.chartX} ${p.chartY}`).reverse().join(' L ')
        : `${points[points.length - 1].chartX} ${chartHeight} L ${points[0].chartX} ${chartHeight}`;

      areaPath = `${linePath} L ${baseline} Z`;

      return {
        name: s.name,
        color,
        fillOpacity,
        points,
        linePath,
        areaPath,
      };
    });

    return { processedSeries, xDomain, yDomain };
  }, [series, chartWidth, chartHeight, stacked, curveType]);

  return (
    <div className={`relative ${className}`}>
      {title && <h3 className="text-lg font-semibold text-stone-900 mb-4">{title}</h3>}

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

          {/* Areas and lines */}
          {processedSeries.map((series, seriesIndex) => (
            <g key={seriesIndex}>
              {/* Area fill */}
              <motion.path
                d={series.areaPath}
                fill={series.color}
                fillOpacity={series.fillOpacity}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: seriesIndex * 0.1, duration: 0.8 }}
                style={{ transformOrigin: `0 ${chartHeight}px` }}
              />

              {/* Line stroke */}
              <motion.path
                d={series.linePath}
                fill="none"
                stroke={series.color}
                strokeWidth={2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: seriesIndex * 0.1, duration: 1.2, ease: 'easeInOut' }}
              />

              {/* Data points */}
              {showDots && series.points.map((point, i) => (
                <motion.circle
                  key={i}
                  cx={point.chartX}
                  cy={point.chartY}
                  r={hoveredPoint?.seriesIndex === seriesIndex && hoveredPoint?.pointIndex === i ? 6 : 4}
                  fill={series.color}
                  stroke="white"
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: seriesIndex * 0.1 + i * 0.02, duration: 0.3 }}
                  onMouseEnter={() => setHoveredPoint({ seriesIndex, pointIndex: i })}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  <title>
                    {series.name} - ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                  </title>
                </motion.circle>
              ))}
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

          {/* Axis labels */}
          {xLabel && (
            <text
              x={chartWidth / 2}
              y={chartHeight + 45}
              textAnchor="middle"
              className="text-sm font-medium fill-stone-700"
            >
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text
              x={-chartHeight / 2}
              y={-45}
              textAnchor="middle"
              transform="rotate(-90)"
              className="text-sm font-medium fill-stone-700"
            >
              {yLabel}
            </text>
          )}

          {/* Tick labels */}
          <g className="text-xs text-stone-600">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const xValue = xDomain[0] + ratio * (xDomain[1] - xDomain[0]);
              const yValue = yDomain[0] + ratio * (yDomain[1] - yDomain[0]);
              return (
                <g key={ratio}>
                  <text
                    x={chartWidth * ratio}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fill="currentColor"
                  >
                    {xValue.toFixed(0)}
                  </text>
                  <text
                    x={-10}
                    y={chartHeight - chartHeight * ratio}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fill="currentColor"
                  >
                    {yValue.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Legend */}
      {showLegend && processedSeries.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {processedSeries.map((series, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: series.color, opacity: series.fillOpacity }}
              />
              <span className="text-sm text-stone-700">{series.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
