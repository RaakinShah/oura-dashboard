import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

export interface CorrelationMatrixProps {
  data: number[][];
  labels?: string[];
  width?: number;
  height?: number;
  cellSize?: number;
  showValues?: boolean;
  colorScheme?: 'diverging' | 'sequential';
  title?: string;
  className?: string;
}

export function CorrelationMatrix({
  data,
  labels,
  width = 600,
  height = 600,
  cellSize = 60,
  showValues = true,
  colorScheme = 'diverging',
  title,
  className = '',
}: CorrelationMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  const correlations = useMemo(() => {
    const n = data.length;
    const p = data[0].length;
    const corr: number[][] = [];

    // Calculate means
    const means = Array.from({ length: p }, (_, j) =>
      data.reduce((sum, row) => sum + row[j], 0) / n
    );

    // Calculate standard deviations
    const stds = Array.from({ length: p }, (_, j) =>
      Math.sqrt(
        data.reduce((sum, row) => sum + Math.pow(row[j] - means[j], 2), 0) / (n - 1)
      )
    );

    // Calculate correlations
    for (let i = 0; i < p; i++) {
      corr[i] = [];
      for (let j = 0; j < p; j++) {
        if (i === j) {
          corr[i][j] = 1;
        } else {
          const cov = data.reduce(
            (sum, row) => sum + (row[i] - means[i]) * (row[j] - means[j]),
            0
          ) / (n - 1);
          corr[i][j] = cov / ((stds[i] || 1) * (stds[j] || 1));
        }
      }
    }

    return corr;
  }, [data]);

  const getColor = (value: number): string => {
    if (colorScheme === 'diverging') {
      // Red-White-Blue diverging scheme
      if (value > 0) {
        const intensity = Math.floor(value * 255);
        return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
      } else {
        const intensity = Math.floor(Math.abs(value) * 255);
        return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
      }
    } else {
      // Sequential blue scheme
      const intensity = Math.floor(Math.abs(value) * 255);
      return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
    }
  };

  const n = correlations.length;
  const totalSize = n * cellSize;
  const padding = 100;

  const varLabels = labels || Array.from({ length: n }, (_, i) => `Var${i + 1}`);

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-stone-900 mb-4">{title}</h3>
      )}

      <svg
        width={totalSize + padding * 2}
        height={totalSize + padding * 2}
        className="overflow-visible"
      >
        <g transform={`translate(${padding}, ${padding})`}>
          {/* Correlation cells */}
          {correlations.map((row, i) =>
            row.map((value, j) => (
              <g key={`${i}-${j}`}>
                <motion.rect
                  x={j * cellSize}
                  y={i * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={getColor(value)}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i + j) * 0.01, duration: 0.3 }}
                  onMouseEnter={() => setHoveredCell({ i, j })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className="cursor-pointer"
                  stroke={hoveredCell?.i === i && hoveredCell?.j === j ? '#000' : 'none'}
                  strokeWidth={2}
                />
                {showValues && (
                  <text
                    x={j * cellSize + cellSize / 2}
                    y={i * cellSize + cellSize / 2}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className={`text-xs font-semibold pointer-events-none ${
                      Math.abs(value) > 0.5 ? 'fill-white' : 'fill-stone-700'
                    }`}
                  >
                    {value.toFixed(2)}
                  </text>
                )}
              </g>
            ))
          )}

          {/* Row labels */}
          <g className="text-sm text-stone-700">
            {varLabels.map((label, i) => (
              <text
                key={i}
                x={-10}
                y={i * cellSize + cellSize / 2}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="currentColor"
              >
                {label}
              </text>
            ))}
          </g>

          {/* Column labels */}
          <g className="text-sm text-stone-700">
            {varLabels.map((label, i) => (
              <text
                key={i}
                x={i * cellSize + cellSize / 2}
                y={-10}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="currentColor"
                transform={`rotate(-45, ${i * cellSize + cellSize / 2}, -10)`}
              >
                {label}
              </text>
            ))}
          </g>
        </g>
      </svg>

      {/* Color scale legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-sm text-stone-600">-1.0</span>
        <div className="flex">
          {Array.from({ length: 100 }, (_, i) => {
            const value = (i / 50) - 1; // -1 to 1
            return (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: '20px',
                  backgroundColor: getColor(value),
                }}
              />
            );
          })}
        </div>
        <span className="text-sm text-stone-600">+1.0</span>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <motion.div
          className="absolute bg-white border border-stone-200 rounded-lg shadow-lg p-3 z-10 pointer-events-none"
          style={{
            left: padding + hoveredCell.j * cellSize + cellSize / 2,
            top: padding + hoveredCell.i * cellSize - 60,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm font-semibold">
            {varLabels[hoveredCell.i]} × {varLabels[hoveredCell.j]}
          </div>
          <div className="text-lg font-bold text-indigo-600">
            r = {correlations[hoveredCell.i][hoveredCell.j].toFixed(3)}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            {Math.abs(correlations[hoveredCell.i][hoveredCell.j]) > 0.7
              ? 'Strong correlation'
              : Math.abs(correlations[hoveredCell.i][hoveredCell.j]) > 0.4
              ? 'Moderate correlation'
              : 'Weak correlation'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
