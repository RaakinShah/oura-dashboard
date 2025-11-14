/**
 * Outlier detection utilities
 */

import { calculateStatistics } from './statistics';

export interface Outlier {
  index: number;
  value: number;
  type: 'mild' | 'extreme';
  direction: 'low' | 'high';
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliersIQR(data: number[], multiplier = 1.5): Outlier[] {
  const stats = calculateStatistics(data);
  const { q1, q3 } = stats.quartiles;
  const { iqr } = stats;

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  const extremeLowerBound = q1 - 3 * iqr;
  const extremeUpperBound = q3 + 3 * iqr;

  const outliers: Outlier[] = [];

  data.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      const isExtreme = value < extremeLowerBound || value > extremeUpperBound;
      outliers.push({
        index,
        value,
        type: isExtreme ? 'extreme' : 'mild',
        direction: value < lowerBound ? 'low' : 'high',
      });
    }
  });

  return outliers;
}

/**
 * Detect outliers using Z-score method
 */
export function detectOutliersZScore(data: number[], threshold = 3): Outlier[] {
  const stats = calculateStatistics(data);
  const outliers: Outlier[] = [];

  data.forEach((value, index) => {
    const zScore = Math.abs((value - stats.mean) / stats.standardDeviation);
    if (zScore > threshold) {
      outliers.push({
        index,
        value,
        type: zScore > threshold * 1.5 ? 'extreme' : 'mild',
        direction: value < stats.mean ? 'low' : 'high',
      });
    }
  });

  return outliers;
}

/**
 * Remove outliers from dataset
 */
export function removeOutliers(data: number[], method: 'iqr' | 'zscore' = 'iqr'): number[] {
  const outliers = method === 'iqr' ? detectOutliersIQR(data) : detectOutliersZScore(data);
  const outlierIndices = new Set(outliers.map((o) => o.index));
  return data.filter((_, index) => !outlierIndices.has(index));
}

/**
 * Replace outliers with median or mean
 */
export function replaceOutliers(
  data: number[],
  replacement: 'median' | 'mean' = 'median',
  method: 'iqr' | 'zscore' = 'iqr'
): number[] {
  const outliers = method === 'iqr' ? detectOutliersIQR(data) : detectOutliersZScore(data);
  const outlierIndices = new Set(outliers.map((o) => o.index));
  const stats = calculateStatistics(data);
  const replacementValue = replacement === 'median' ? stats.median : stats.mean;

  return data.map((value, index) => 
    outlierIndices.has(index) ? replacementValue : value
  );
}
