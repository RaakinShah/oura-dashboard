/**
 * Benchmarking and comparison utilities
 */

export interface BenchmarkRange {
  poor: { min: number; max: number };
  fair: { min: number; max: number };
  good: { min: number; max: number };
  excellent: { min: number; max: number };
}

export interface BenchmarkResult {
  value: number;
  category: 'poor' | 'fair' | 'good' | 'excellent';
  percentile: number;
  comparison: string;
}

/**
 * Sleep duration benchmarks (hours)
 */
export const SLEEP_DURATION_BENCHMARK: BenchmarkRange = {
  poor: { min: 0, max: 5.5 },
  fair: { min: 5.5, max: 7 },
  good: { min: 7, max: 9 },
  excellent: { min: 9, max: 12 },
};

/**
 * Sleep efficiency benchmarks (percentage)
 */
export const SLEEP_EFFICIENCY_BENCHMARK: BenchmarkRange = {
  poor: { min: 0, max: 70 },
  fair: { min: 70, max: 80 },
  good: { min: 80, max: 90 },
  excellent: { min: 90, max: 100 },
};

/**
 * Daily steps benchmarks
 */
export const STEPS_BENCHMARK: BenchmarkRange = {
  poor: { min: 0, max: 5000 },
  fair: { min: 5000, max: 7500 },
  good: { min: 7500, max: 10000 },
  excellent: { min: 10000, max: 50000 },
};

/**
 * Active calories benchmarks (kcal)
 */
export const ACTIVE_CALORIES_BENCHMARK: BenchmarkRange = {
  poor: { min: 0, max: 200 },
  fair: { min: 200, max: 400 },
  good: { min: 400, max: 600 },
  excellent: { min: 600, max: 2000 },
};

/**
 * Benchmark a value against a range
 */
export function benchmark(value: number, range: BenchmarkRange): BenchmarkResult {
  let category: 'poor' | 'fair' | 'good' | 'excellent';

  if (value >= range.excellent.min && value <= range.excellent.max) {
    category = 'excellent';
  } else if (value >= range.good.min && value <= range.good.max) {
    category = 'good';
  } else if (value >= range.fair.min && value <= range.fair.max) {
    category = 'fair';
  } else {
    category = 'poor';
  }

  // Calculate percentile (simplified)
  const allRanges = [range.poor, range.fair, range.good, range.excellent];
  const totalRange = Math.max(...allRanges.map((r) => r.max)) - Math.min(...allRanges.map((r) => r.min));
  const valuePosition = value - Math.min(...allRanges.map((r) => r.min));
  const percentile = Math.min(100, Math.max(0, (valuePosition / totalRange) * 100));

  const comparison = getComparisonText(category, value, range);

  return {
    value,
    category,
    percentile: Math.round(percentile),
    comparison,
  };
}

function getComparisonText(
  category: 'poor' | 'fair' | 'good' | 'excellent',
  value: number,
  range: BenchmarkRange
): string {
  switch (category) {
    case 'excellent':
      return 'Your performance is exceptional and well above average!';
    case 'good':
      return 'You\'re doing great and meeting recommended health targets.';
    case 'fair':
      return 'Your performance is adequate but has room for improvement.';
    case 'poor':
      return 'Your performance is below recommended levels. Consider making improvements.';
  }
}

/**
 * Compare value to population average
 */
export function compareToAverage(
  value: number,
  average: number,
  stdDev: number
): {
  difference: number;
  percentDifference: number;
  standardDeviations: number;
  comparison: 'well above' | 'above' | 'average' | 'below' | 'well below';
} {
  const difference = value - average;
  const percentDifference = (difference / average) * 100;
  const standardDeviations = difference / stdDev;

  let comparison: 'well above' | 'above' | 'average' | 'below' | 'well below';

  if (standardDeviations > 1) {
    comparison = 'well above';
  } else if (standardDeviations > 0.5) {
    comparison = 'above';
  } else if (standardDeviations > -0.5) {
    comparison = 'average';
  } else if (standardDeviations > -1) {
    comparison = 'below';
  } else {
    comparison = 'well below';
  }

  return {
    difference,
    percentDifference,
    standardDeviations,
    comparison,
  };
}

/**
 * Get percentile rank in dataset
 */
export function getPercentileRank(value: number, dataset: number[]): number {
  const sorted = [...dataset].sort((a, b) => a - b);
  const count = sorted.filter((v) => v <= value).length;
  return (count / sorted.length) * 100;
}

/**
 * Compare two time periods
 */
export function comparePeriods(
  currentPeriod: number[],
  previousPeriod: number[]
): {
  currentAverage: number;
  previousAverage: number;
  change: number;
  percentChange: number;
  trend: 'improved' | 'declined' | 'stable';
} {
  const currentAverage = currentPeriod.reduce((sum, val) => sum + val, 0) / currentPeriod.length;
  const previousAverage = previousPeriod.reduce((sum, val) => sum + val, 0) / previousPeriod.length;

  const change = currentAverage - previousAverage;
  const percentChange = (change / previousAverage) * 100;

  let trend: 'improved' | 'declined' | 'stable';
  if (Math.abs(percentChange) < 5) {
    trend = 'stable';
  } else {
    trend = percentChange > 0 ? 'improved' : 'declined';
  }

  return {
    currentAverage,
    previousAverage,
    change,
    percentChange,
    trend,
  };
}
