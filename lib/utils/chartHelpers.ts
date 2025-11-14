/**
 * Chart and data visualization helpers
 */

export interface ChartDataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

/**
 * Calculate chart dimensions and margins
 */
export function calculateChartDimensions(
  containerWidth: number,
  containerHeight: number,
  margin = { top: 20, right: 20, bottom: 40, left: 50 }
) {
  return {
    width: containerWidth - margin.left - margin.right,
    height: containerHeight - margin.top - margin.bottom,
    margin,
  };
}

/**
 * Generate color palette for charts
 */
export function generateColorPalette(count: number, baseHue = 140): string[] {
  const colors: string[] = [];
  const saturation = 60;
  const lightness = 50;

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (i * 360) / count) % 360;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

/**
 * Format chart axis labels
 */
export function formatAxisLabel(value: number, type: 'number' | 'percentage' | 'currency' | 'duration'): string {
  switch (type) {
    case 'percentage':
      return `${value}%`;
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'duration':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    default:
      return value.toLocaleString();
  }
}

/**
 * Calculate nice tick values for axis
 */
export function calculateNiceTicks(min: number, max: number, targetCount = 5): number[] {
  const range = max - min;
  const roughStep = range / (targetCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual > 5) {
    niceStep = 10 * magnitude;
  } else if (residual > 2) {
    niceStep = 5 * magnitude;
  } else if (residual > 1) {
    niceStep = 2 * magnitude;
  } else {
    niceStep = magnitude;
  }

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
    ticks.push(tick);
  }

  return ticks;
}

/**
 * Scale value to pixel coordinates
 */
export function scaleLinear(
  value: number,
  domain: [number, number],
  range: [number, number]
): number {
  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;

  const ratio = (value - domainMin) / (domainMax - domainMin);
  return rangeMin + ratio * (rangeMax - rangeMin);
}

/**
 * Calculate data extent (min, max)
 */
export function calculateExtent(data: number[]): [number, number] {
  if (data.length === 0) return [0, 0];
  return [Math.min(...data), Math.max(...data)];
}

/**
 * Interpolate between two values
 */
export function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

/**
 * Generate smooth curve path (Catmull-Rom)
 */
export function generateSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Calculate chart legend layout
 */
export function calculateLegendLayout(
  items: string[],
  maxWidth: number,
  itemWidth = 120
): { rows: string[][]; height: number } {
  const itemsPerRow = Math.floor(maxWidth / itemWidth);
  const rows: string[][] = [];

  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  return {
    rows,
    height: rows.length * 30,
  };
}

/**
 * Format large numbers for charts (K, M, B)
 */
export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toString();
}

/**
 * Detect and handle chart data anomalies
 */
export function detectChartAnomalies(data: number[], threshold = 3): number[] {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return data.map((value) => {
    const zScore = Math.abs((value - mean) / stdDev);
    return zScore > threshold ? mean : value;
  });
}
