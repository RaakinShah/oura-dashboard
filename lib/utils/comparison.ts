/**
 * Data comparison utilities for analytics
 */

export interface ComparisonResult {
  current: number;
  previous: number;
  change: number;
  percentChange: number;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Compare two numeric values
 */
export function compareValues(current: number, previous: number): ComparisonResult {
  const change = current - previous;
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return {
    current,
    previous,
    change,
    percentChange,
    trend,
  };
}

/**
 * Compare arrays of data (e.g., this week vs last week)
 */
export function compareDataSets(
  current: number[],
  previous: number[]
): ComparisonResult {
  const currentAvg = current.reduce((a, b) => a + b, 0) / current.length;
  const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

  return compareValues(currentAvg, previousAvg);
}

/**
 * Get comparison label
 */
export function getComparisonLabel(comparison: ComparisonResult, metric: string): string {
  const { trend, change, percentChange } = comparison;

  if (trend === 'neutral') {
    return `No change in ${metric}`;
  }

  const direction = trend === 'up' ? 'increased' : 'decreased';
  const changeText = Math.abs(change).toFixed(1);
  const percentText = Math.abs(percentChange).toFixed(1);

  return `${metric} ${direction} by ${changeText} (${percentText}%)`;
}

/**
 * Format comparison for display
 */
export function formatComparison(comparison: ComparisonResult): string {
  const { trend, percentChange } = comparison;

  if (trend === 'neutral') {
    return '—';
  }

  const sign = trend === 'up' ? '+' : '';
  return `${sign}${percentChange.toFixed(1)}%`;
}

/**
 * Compare metric trends over time
 */
export function analyzeTrend(data: number[], windowSize = 7): {
  isImproving: boolean;
  isStable: boolean;
  isDeclining: boolean;
  slope: number;
} {
  if (data.length < windowSize) {
    return { isImproving: false, isStable: true, isDeclining: false, slope: 0 };
  }

  // Calculate linear regression slope
  const n = data.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = data.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const threshold = 0.1;
  const isImproving = slope > threshold;
  const isDeclining = slope < -threshold;
  const isStable = Math.abs(slope) <= threshold;

  return {
    isImproving,
    isStable,
    isDeclining,
    slope,
  };
}

/**
 * Calculate moving average
 */
export function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
    result.push(avg);
  }

  return result;
}

/**
 * Calculate percentile rank
 */
export function percentileRank(value: number, dataset: number[]): number {
  const sorted = [...dataset].sort((a, b) => a - b);
  const index = sorted.findIndex((v) => v >= value);

  if (index === -1) return 100;
  if (index === 0) return 0;

  return (index / sorted.length) * 100;
}

/**
 * Identify outliers in dataset
 */
export function findOutliers(data: number[]): {
  outliers: number[];
  lower: number;
  upper: number;
} {
  const sorted = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const outliers = data.filter((v) => v < lower || v > upper);

  return { outliers, lower, upper };
}
