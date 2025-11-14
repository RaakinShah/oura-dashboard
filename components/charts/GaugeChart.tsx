import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  colors?: string[];
  thresholds?: number[];
  showValue?: boolean;
  showLabels?: boolean;
  showNeedle?: boolean;
  label?: string;
  unit?: string;
  title?: string;
  className?: string;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 300,
  thickness = 30,
  startAngle = -120,
  endAngle = 120,
  colors,
  thresholds,
  showValue = true,
  showLabels = true,
  showNeedle = true,
  label,
  unit = '',
  title,
  className = '',
}: GaugeChartProps) {
  const radius = (size - thickness) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  const defaultColors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];
  const defaultThresholds = [20, 40, 60, 80, 100];

  const gaugeColors = colors || defaultColors;
  const gaugeThresholds = thresholds || defaultThresholds;

  const { segments, needleAngle, displayValue } = useMemo(() => {
    const range = max - min;
    const normalizedValue = Math.max(min, Math.min(max, value));
    const valueRatio = (normalizedValue - min) / range;

    const totalAngle = endAngle - startAngle;
    const needleAngle = startAngle + valueRatio * totalAngle;

    const segments = gaugeThresholds.map((threshold, i) => {
      const prevThreshold = i === 0 ? min : gaugeThresholds[i - 1];
      const startRatio = (prevThreshold - min) / range;
      const endRatio = (threshold - min) / range;

      const segmentStartAngle = startAngle + startRatio * totalAngle;
      const segmentEndAngle = startAngle + endRatio * totalAngle;

      return {
        color: gaugeColors[i % gaugeColors.length],
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        startValue: prevThreshold,
        endValue: threshold,
      };
    });

    return {
      segments,
      needleAngle,
      displayValue: normalizedValue,
    };
  }, [value, min, max, startAngle, endAngle, gaugeColors, gaugeThresholds]);

  const createArc = (innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);
    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  const needlePath = useMemo(() => {
    const needleRad = (needleAngle * Math.PI) / 180;
    const needleLength = radius + thickness / 2;
    const needleWidth = 8;

    const tipX = centerX + needleLength * Math.cos(needleRad);
    const tipY = centerY + needleLength * Math.sin(needleRad);

    const perpRad = needleRad + Math.PI / 2;
    const base1X = centerX + needleWidth * Math.cos(perpRad);
    const base1Y = centerY + needleWidth * Math.sin(perpRad);
    const base2X = centerX - needleWidth * Math.cos(perpRad);
    const base2Y = centerY - needleWidth * Math.sin(perpRad);

    return `M ${tipX} ${tipY} L ${base1X} ${base1Y} L ${base2X} ${base2Y} Z`;
  }, [needleAngle, radius, thickness, centerX, centerY]);

  return (
    <div className={`relative ${className}`}>
      {title && <h3 className="text-lg font-semibold text-stone-900 mb-4 text-center">{title}</h3>}

      <svg width={size} height={size} className="overflow-visible">
        {segments.map((segment, i) => (
          <motion.path
            key={i}
            d={createArc(radius - thickness / 2, radius + thickness / 2, segment.startAngle, segment.endAngle)}
            fill={segment.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}

        {showLabels && (
          <g className="text-xs fill-stone-600">
            {[min, ...gaugeThresholds].map((threshold, i) => {
              const angle = startAngle + ((threshold - min) / (max - min)) * (endAngle - startAngle);
              const rad = (angle * Math.PI) / 180;
              const labelRadius = radius + thickness + 20;
              const x = centerX + labelRadius * Math.cos(rad);
              const y = centerY + labelRadius * Math.sin(rad);

              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="font-semibold"
                >
                  {threshold}
                </text>
              );
            })}
          </g>
        )}

        {showNeedle && (
          <motion.g
            initial={{ rotate: startAngle }}
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 60, damping: 15, duration: 1.5 }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          >
            <path
              d={needlePath}
              fill="#1e293b"
              stroke="white"
              strokeWidth={2}
            />
          </motion.g>
        )}

        <circle
          cx={centerX}
          cy={centerY}
          r={12}
          fill="#1e293b"
          stroke="white"
          strokeWidth={3}
        />

        {showValue && (
          <g>
            <text
              x={centerX}
              y={centerY + 40}
              textAnchor="middle"
              className="text-3xl font-bold fill-stone-900"
            >
              {displayValue.toFixed(1)}
              {unit && <tspan className="text-xl fill-stone-600">{unit}</tspan>}
            </text>
            {label && (
              <text
                x={centerX}
                y={centerY + 65}
                textAnchor="middle"
                className="text-sm fill-stone-600"
              >
                {label}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
