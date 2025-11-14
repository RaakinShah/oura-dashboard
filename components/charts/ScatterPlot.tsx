import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

export interface ScatterDataPoint {
  x: number;
  y: number;
  label?: string;
  group?: string;
  size?: number;
}

export interface ScatterPlotProps {
  data: ScatterDataPoint[];
  width?: number;
  height?: number;
  showRegression?: boolean;
  showTrendline?: boolean;
  colorByGroup?: boolean;
  enableBrushing?: boolean;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}

export function ScatterPlot({
  data,
  width = 600,
  height = 400,
  showRegression = true,
  showTrendline = true,
  colorByGroup = true,
  enableBrushing = false,
  title,
  xLabel,
  yLabel,
  className = '',
}: ScatterPlotProps) {
  const [selectedPoints, setSelectedPoints] = useState<Set<number>>(new Set());
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { points, regression, groups, xDomain, yDomain } = useMemo(() => {
    if (!data.length) return { points: [], regression: null, groups: new Set(), xDomain: [0, 1], yDomain: [0, 1] };

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    const xDomain = [xMin - xRange * 0.1, xMax + xRange * 0.1];
    const yDomain = [yMin - yRange * 0.1, yMax + yRange * 0.1];

    const points = data.map((d, i) => ({
      x: ((d.x - xDomain[0]) / (xDomain[1] - xDomain[0])) * chartWidth,
      y: chartHeight - ((d.y - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight,
      data: d,
      index: i,
    }));

    const groups = new Set(data.map(d => d.group).filter(Boolean));

    // Calculate linear regression
    let regression = null;
    if (showRegression) {
      const n = data.length;
      const sumX = data.reduce((sum, d) => sum + d.x, 0);
      const sumY = data.reduce((sum, d) => sum + d.y, 0);
      const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
      const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      const x1 = xDomain[0];
      const y1 = slope * x1 + intercept;
      const x2 = xDomain[1];
      const y2 = slope * x2 + intercept;

      regression = {
        slope,
        intercept,
        r2: calculateR2(data, slope, intercept),
        points: [
          { x: 0, y: chartHeight - ((y1 - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight },
          { x: chartWidth, y: chartHeight - ((y2 - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight },
        ],
      };
    }

    return { points, regression, groups, xDomain, yDomain };
  }, [data, chartWidth, chartHeight, showRegression]);

  const calculateR2 = (data: ScatterDataPoint[], slope: number, intercept: number): number => {
    const yMean = data.reduce((sum, d) => sum + d.y, 0) / data.length;
    const ssRes = data.reduce((sum, d) => sum + Math.pow(d.y - (slope * d.x + intercept), 2), 0);
    const ssTot = data.reduce((sum, d) => sum + Math.pow(d.y - yMean, 2), 0);
    return 1 - (ssRes / ssTot);
  };

  const groupColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className={`relative ${className}`}>
      {title && <h3 className="text-lg font-semibold text-stone-900 mb-4">{title}</h3>}

      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid */}
          <g className="text-stone-200">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1={0}
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                <line
                  x1={chartWidth * ratio}
                  y1={0}
                  x2={chartWidth * ratio}
                  y2={chartHeight}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              </g>
            ))}
          </g>

          {/* Regression line */}
          {showTrendline && regression && (
            <g>
              <line
                x1={regression.points[0].x}
                y1={regression.points[0].y}
                x2={regression.points[1].x}
                y2={regression.points[1].y}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4,4"
              />
              <text
                x={chartWidth - 10}
                y={regression.points[1].y - 10}
                textAnchor="end"
                className="text-xs fill-red-600 font-semibold"
              >
                R² = {regression.r2.toFixed(3)}
              </text>
            </g>
          )}

          {/* Points */}
          {points.map((point, i) => {
            const groupIndex = point.data.group
              ? Array.from(groups).indexOf(point.data.group)
              : 0;
            const color = colorByGroup && point.data.group
              ? groupColors[groupIndex % groupColors.length]
              : '#6366f1';
            const isSelected = selectedPoints.has(i);
            const isHovered = hoveredPoint === i;
            const radius = (point.data.size || 1) * (isHovered ? 8 : isSelected ? 6 : 4);

            return (
              <motion.circle
                key={i}
                cx={point.x}
                cy={point.y}
                r={radius}
                fill={color}
                fillOpacity={isSelected || isHovered ? 1 : 0.7}
                stroke="white"
                strokeWidth={isHovered ? 3 : 2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.01, duration: 0.3 }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => {
                  if (enableBrushing) {
                    setSelectedPoints(prev => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    });
                  }
                }}
                className="cursor-pointer"
              >
                <title>
                  {point.data.label || `(${point.data.x.toFixed(2)}, ${point.data.y.toFixed(2)})`}
                  {point.data.group && ` - ${point.data.group}`}
                </title>
              </motion.circle>
            );
          })}

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

          {/* Axis tick labels */}
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
                    {xValue.toFixed(1)}
                  </text>
                  <text
                    x={-10}
                    y={chartHeight - chartHeight * ratio}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fill="currentColor"
                  >
                    {yValue.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Legend */}
      {colorByGroup && groups.size > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {Array.from(groups).map((group, i) => (
            <div key={`legend-${i}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: groupColors[i % groupColors.length] }}
              />
              <span className="text-sm text-stone-700">{String(group)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats panel */}
      {regression && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-stone-600">Slope</div>
              <div className="font-semibold text-stone-900">{regression.slope.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-stone-600">Intercept</div>
              <div className="font-semibold text-stone-900">{regression.intercept.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-stone-600">R²</div>
              <div className="font-semibold text-stone-900">{regression.r2.toFixed(4)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
