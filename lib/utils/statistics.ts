/**
 * Advanced statistical utilities for health data analysis
 */

export interface StatisticalSummary {
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  variance: number;
  standardDeviation: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  iqr: number;
}

/**
 * Calculate comprehensive statistical summary
 */
export function calculateStatistics(data: number[]): StatisticalSummary {
  if (data.length === 0) {
    throw new Error('Cannot calculate statistics on empty array');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;

  // Mean
  const mean = data.reduce((sum, val) => sum + val, 0) / n;

  // Median
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Mode
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  data.forEach((val) => {
    frequency[val] = (frequency[val] || 0) + 1;
    maxFreq = Math.max(maxFreq, frequency[val]);
  });
  const mode = Object.keys(frequency)
    .filter((key) => frequency[Number(key)] === maxFreq)
    .map(Number);

  // Min, Max, Range
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  // Variance and Standard Deviation
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);

  // Quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const q2 = median;
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  return {
    mean,
    median,
    mode,
    min,
    max,
    range,
    variance,
    standardDeviation,
    quartiles: { q1, q2, q3 },
    iqr,
  };
}

/**
 * Calculate correlation between two datasets
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    throw new Error('Arrays must be of equal non-zero length');
  }

  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let sumXSquared = 0;
  let sumYSquared = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    sumXSquared += diffX * diffX;
    sumYSquared += diffY * diffY;
  }

  const denominator = Math.sqrt(sumXSquared * sumYSquared);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate percentile of a value in a dataset
 */
export function calculatePercentile(value: number, data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const count = sorted.filter((v) => v <= value).length;
  return (count / sorted.length) * 100;
}

/**
 * Calculate z-score (standard score)
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Normalize data to 0-1 range
 */
export function normalize(data: number[]): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  if (range === 0) return data.map(() => 0.5);
  
  return data.map((val) => (val - min) / range);
}

/**
 * Standardize data (z-score normalization)
 */
export function standardize(data: number[]): number[] {
  const stats = calculateStatistics(data);
  return data.map((val) => calculateZScore(val, stats.mean, stats.standardDeviation));
}
