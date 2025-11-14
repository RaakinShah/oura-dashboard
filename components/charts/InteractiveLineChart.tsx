import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface InteractiveDataPoint {
  x: number | string;
  y: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface InteractiveLineChartProps {
  data: InteractiveDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  showCrosshair?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  showLegend?: boolean;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}

export function InteractiveLineChart({
  data,
  width = 600,
  height = 400,
  color = '#6366f1',
  showTooltip = true,
  showCrosshair = true,
  enableZoom = true,
  enablePan = true,
  showLegend = false,
  title,
  xLabel,
  yLabel,
  className = '',
}: InteractiveLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const padding = { top: title ? 60 : 40, right: 40, bottom: xLabel ? 80 : 60, left: yLabel ? 80 : 60 };
  const chartWidth = (width - padding.left - padding.right) * zoomLevel;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate data bounds
  const yValues = data.map(d => d.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const range = maxY - minY || 1;

  // Map data to points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * chartWidth + panOffset.x;
    const y = chartHeight - ((d.y - minY) / range) * chartHeight;
    return { x, y, data: d };
  });

  // Create path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${chartHeight} L ${points[0]?.x || 0} ${chartHeight} Z`;

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;
    const y = e.clientY - rect.top - padding.top;

    setMousePos({ x, y });

    if (isPanning && enablePan) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Find nearest point
    if (showTooltip || showCrosshair) {
      let minDist = Infinity;
      let nearestIndex = -1;

      points.forEach((p, i) => {
        const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
        if (dist < minDist && dist < 30) {
          minDist = dist;
          nearestIndex = i;
        }
      });

      setHoveredPoint(nearestIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setIsPanning(false);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (enablePan) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (!enableZoom) return;
    e.preventDefault();

    const delta = e.deltaY * -0.001;
    const newZoom = Math.max(0.5, Math.min(5, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const preventScroll = (e: WheelEvent) => {
      if (enableZoom) {
        e.preventDefault();
      }
    };

    svg.addEventListener('wheel', preventScroll, { passive: false });
    return () => svg.removeEventListener('wheel', preventScroll);
  }, [enableZoom]);

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-stone-900 mb-4 text-center">
          {title}
        </h3>
      )}

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-hidden cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid */}
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
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
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

          {/* Area */}
          <motion.path
            d={areaD}
            fill={color}
            fillOpacity={0.1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Points */}
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === i ? 6 : 3}
              fill={hoveredPoint === i ? color : 'white'}
              stroke={color}
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="cursor-pointer"
            />
          ))}

          {/* Crosshair */}
          {showCrosshair && hoveredPoint !== null && points[hoveredPoint] && (
            <g className="pointer-events-none">
              <line
                x1={points[hoveredPoint].x}
                y1={0}
                x2={points[hoveredPoint].x}
                y2={chartHeight}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.5}
              />
              <line
                x1={0}
                y1={points[hoveredPoint].y}
                x2={chartWidth}
                y2={points[hoveredPoint].y}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.5}
              />
            </g>
          )}

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

          {/* Y-axis labels */}
          <g className="text-xs text-stone-600">
            {[maxY, (maxY + minY) / 2, minY].map((value, i) => (
              <text
                key={i}
                x={-10}
                y={chartHeight * (i / 2)}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="currentColor"
              >
                {value.toFixed(1)}
              </text>
            ))}
          </g>

          {/* X-axis labels */}
          <g className="text-xs text-stone-600">
            {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0).map((point, i) => (
              <text
                key={i}
                x={point.x}
                y={chartHeight + 20}
                textAnchor="middle"
                fill="currentColor"
              >
                {point.data.label || point.data.x}
              </text>
            ))}
          </g>

          {/* Axis labels */}
          {yLabel && (
            <text
              x={-chartHeight / 2}
              y={-50}
              textAnchor="middle"
              className="text-sm font-medium fill-stone-700"
              transform="rotate(-90)"
            >
              {yLabel}
            </text>
          )}
          {xLabel && (
            <text
              x={chartWidth / 2}
              y={chartHeight + 50}
              textAnchor="middle"
              className="text-sm font-medium fill-stone-700"
            >
              {xLabel}
            </text>
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredPoint !== null && points[hoveredPoint] && (
        <motion.div
          className="absolute bg-white border border-stone-200 rounded-lg shadow-lg p-3 pointer-events-none z-10"
          style={{
            left: padding.left + points[hoveredPoint].x + 10,
            top: padding.top + points[hoveredPoint].y - 60,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-sm font-semibold text-stone-900">
            {points[hoveredPoint].data.label || points[hoveredPoint].data.x}
          </div>
          <div className="text-lg font-bold text-indigo-600">
            {points[hoveredPoint].data.y.toFixed(2)}
          </div>
          {points[hoveredPoint].data.metadata && (
            <div className="mt-2 text-xs text-stone-600 space-y-1">
              {Object.entries(points[hoveredPoint].data.metadata!).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Controls */}
      {(enableZoom || enablePan) && (
        <div className="absolute top-4 right-4 bg-white border border-stone-200 rounded-lg shadow-sm p-2 text-xs text-stone-600">
          {enableZoom && (
            <div className="flex items-center gap-2">
              <span>Zoom:</span>
              <button
                onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.2))}
                className="px-2 py-1 bg-stone-100 rounded hover:bg-stone-200"
              >
                −
              </button>
              <span className="font-mono">{(zoomLevel * 100).toFixed(0)}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(5, z + 0.2))}
                className="px-2 py-1 bg-stone-100 rounded hover:bg-stone-200"
              >
                +
              </button>
            </div>
          )}
          {enablePan && (
            <div className="mt-2">
              <button
                onClick={() => setPanOffset({ x: 0, y: 0 })}
                className="w-full px-2 py-1 bg-stone-100 rounded hover:bg-stone-200"
              >
                Reset Pan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
