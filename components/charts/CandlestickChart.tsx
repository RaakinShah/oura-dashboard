import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

export interface CandlestickDataPoint {
  x: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  metadata?: Record<string, any>;
}

export interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  width?: number;
  height?: number;
  showVolume?: boolean;
  bullishColor?: string;
  bearishColor?: string;
  wickColor?: string;
  showGrid?: boolean;
  xLabel?: string;
  yLabel?: string;
  title?: string;
  className?: string;
}

export function CandlestickChart({
  data,
  width = 800,
  height = 500,
  showVolume = true,
  bullishColor = '#22c55e',
  bearishColor = '#ef4444',
  wickColor = '#64748b',
  showGrid = true,
  xLabel,
  yLabel,
  title,
  className = '',
}: CandlestickChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const padding = { top: 40, right: 60, bottom: showVolume ? 120 : 60, left: 60 };
  const chartHeight = showVolume ? (height - padding.top - padding.bottom) * 0.7 : height - padding.top - padding.bottom;
  const volumeHeight = showVolume ? (height - padding.top - padding.bottom) * 0.25 : 0;
  const chartWidth = width - padding.left - padding.right;

  const { candles, yDomain, maxVolume } = useMemo(() => {
    if (data.length === 0) {
      return { candles: [], yDomain: [0, 100], maxVolume: 0 };
    }

    const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const yMin = Math.min(...allPrices);
    const yMax = Math.max(...allPrices);
    const yPadding = (yMax - yMin) * 0.1;
    const yDomain = [yMin - yPadding, yMax + yPadding];

    const maxVolume = showVolume
      ? Math.max(...data.map(d => d.volume || 0))
      : 0;

    const candleWidth = chartWidth / data.length;
    const bodyWidth = candleWidth * 0.7;

    const candles = data.map((d, i) => {
      const x = i * candleWidth + candleWidth / 2;

      const openY = chartHeight - ((d.open - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight;
      const closeY = chartHeight - ((d.close - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight;
      const highY = chartHeight - ((d.high - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight;
      const lowY = chartHeight - ((d.low - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeight;

      const isBullish = d.close >= d.open;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;

      const volumeY = d.volume && maxVolume
        ? volumeHeight - (d.volume / maxVolume) * volumeHeight
        : volumeHeight;
      const volumeBarHeight = d.volume && maxVolume
        ? (d.volume / maxVolume) * volumeHeight
        : 0;

      return {
        ...d,
        x,
        bodyWidth,
        bodyTop,
        bodyHeight,
        highY,
        lowY,
        isBullish,
        volumeY,
        volumeBarHeight,
      };
    });

    return { candles, yDomain, maxVolume };
  }, [data, chartWidth, chartHeight, volumeHeight, showVolume]);

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

          {/* Candles */}
          {candles.map((candle, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.01, duration: 0.3 }}
              style={{ transformOrigin: `${candle.x}px ${chartHeight}px` }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* High-Low Wick */}
              <line
                x1={candle.x}
                y1={candle.highY}
                x2={candle.x}
                y2={candle.lowY}
                stroke={wickColor}
                strokeWidth={1}
              />

              {/* Open-Close Body */}
              <rect
                x={candle.x - candle.bodyWidth / 2}
                y={candle.bodyTop}
                width={candle.bodyWidth}
                height={candle.bodyHeight}
                fill={candle.isBullish ? bullishColor : bearishColor}
                stroke={hoveredIndex === i ? '#1e293b' : candle.isBullish ? bullishColor : bearishColor}
                strokeWidth={hoveredIndex === i ? 2 : 1}
                opacity={hoveredIndex === i ? 1 : 0.9}
              >
                <title>
                  {String(candle.x)}
                  {'\n'}Open: {candle.open.toFixed(2)}
                  {'\n'}High: {candle.high.toFixed(2)}
                  {'\n'}Low: {candle.low.toFixed(2)}
                  {'\n'}Close: {candle.close.toFixed(2)}
                  {candle.volume !== undefined && `\nVolume: ${candle.volume.toFixed(0)}`}
                </title>
              </rect>
            </motion.g>
          ))}

          {/* Y-axis */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={chartHeight}
            stroke="#64748b"
            strokeWidth={2}
          />

          {/* Y-axis labels */}
          <g className="text-xs text-stone-600">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = yDomain[0] + ratio * (yDomain[1] - yDomain[0]);
              return (
                <text
                  key={ratio}
                  x={-10}
                  y={chartHeight - chartHeight * ratio}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fill="currentColor"
                >
                  {value.toFixed(2)}
                </text>
              );
            })}
          </g>

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
        </g>

        {/* Volume bars */}
        {showVolume && (
          <g transform={`translate(${padding.left}, ${padding.top + chartHeight + 20})`}>
            <line
              x1={0}
              y1={volumeHeight}
              x2={chartWidth}
              y2={volumeHeight}
              stroke="#64748b"
              strokeWidth={1}
            />

            {candles.map((candle, i) => (
              <motion.rect
                key={i}
                x={candle.x - candle.bodyWidth / 2}
                y={candle.volumeY}
                width={candle.bodyWidth}
                height={candle.volumeBarHeight}
                fill={candle.isBullish ? bullishColor : bearishColor}
                opacity={0.5}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.01, duration: 0.3 }}
                style={{ transformOrigin: `${candle.x}px ${volumeHeight}px` }}
              />
            ))}

            <text
              x={-10}
              y={0}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-stone-600"
            >
              {maxVolume.toFixed(0)}
            </text>
            <text
              x={-volumeHeight / 2}
              y={-35}
              textAnchor="middle"
              transform="rotate(-90)"
              className="text-sm font-medium fill-stone-700"
            >
              Volume
            </text>
          </g>
        )}

        {/* X-axis */}
        <g transform={`translate(${padding.left}, ${padding.top + chartHeight})`}>
          <line
            x1={0}
            y1={0}
            x2={chartWidth}
            y2={0}
            stroke="#64748b"
            strokeWidth={2}
          />

          {/* X-axis labels (show every nth label to avoid crowding) */}
          <g className="text-xs text-stone-600">
            {candles.filter((_, i) => i % Math.ceil(candles.length / 10) === 0).map((candle, i) => (
              <text
                key={i}
                x={candle.x}
                y={15}
                textAnchor="middle"
                fill="currentColor"
              >
                {String(candle.x)}
              </text>
            ))}
          </g>

          {xLabel && (
            <text
              x={chartWidth / 2}
              y={45}
              textAnchor="middle"
              className="text-sm font-medium fill-stone-700"
            >
              {xLabel}
            </text>
          )}
        </g>
      </svg>

      {/* Hover info */}
      {hoveredIndex !== null && candles[hoveredIndex] && (
        <div className="absolute top-2 right-2 bg-white border border-stone-200 rounded-lg shadow-lg p-3 text-sm">
          <div className="font-semibold text-stone-900 mb-2">
            {String(candles[hoveredIndex].x)}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-stone-600">Open:</span>
            <span className="font-semibold">{candles[hoveredIndex].open.toFixed(2)}</span>
            <span className="text-stone-600">High:</span>
            <span className="font-semibold">{candles[hoveredIndex].high.toFixed(2)}</span>
            <span className="text-stone-600">Low:</span>
            <span className="font-semibold">{candles[hoveredIndex].low.toFixed(2)}</span>
            <span className="text-stone-600">Close:</span>
            <span className="font-semibold">{candles[hoveredIndex].close.toFixed(2)}</span>
            {candles[hoveredIndex].volume !== undefined && (
              <>
                <span className="text-stone-600">Volume:</span>
                <span className="font-semibold">{candles[hoveredIndex].volume!.toFixed(0)}</span>
              </>
            )}
          </div>
          <div className={`mt-2 pt-2 border-t border-stone-200 font-semibold ${candles[hoveredIndex].isBullish ? 'text-green-600' : 'text-red-600'}`}>
            {candles[hoveredIndex].isBullish ? '↑ Bullish' : '↓ Bearish'}
          </div>
        </div>
      )}
    </div>
  );
}
