/**
 * Data Transformation Utilities
 * Functions for normalizing, scaling, and transforming data
 */

export interface NormalizationResult {
  data: number[];
  min: number;
  max: number;
  mean?: number;
  std?: number;
}

/**
 * Min-Max Normalization (0-1 scaling)
 */
export function minMaxNormalize(data: number[]): NormalizationResult {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const normalized = data.map(val => (val - min) / range);

  return { data: normalized, min, max };
}

/**
 * Z-Score Normalization (standardization)
 */
export function zScoreNormalize(data: number[]): NormalizationResult {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const std = Math.sqrt(variance);

  const normalized = data.map(val => (val - mean) / (std || 1));

  return { data: normalized, min: 0, max: 0, mean, std };
}

/**
 * Robust Scaling (using median and IQR)
 */
export function robustScale(data: number[]): number[] {
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1 || 1;

  return data.map(val => (val - median) / iqr);
}

/**
 * Log Transformation
 */
export function logTransform(data: number[], base: number = Math.E): number[] {
  return data.map(val => Math.log(val > 0 ? val : 1) / Math.log(base));
}

/**
 * Box-Cox Transformation
 */
export function boxCoxTransform(data: number[], lambda: number = 0): number[] {
  if (lambda === 0) {
    return logTransform(data);
  }

  return data.map(val => (Math.pow(val, lambda) - 1) / lambda);
}

/**
 * Binning/Discretization
 */
export function binData(data: number[], numBins: number = 10): { bins: number[]; edges: number[] } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;

  const edges = Array.from({ length: numBins + 1 }, (_, i) => min + i * binWidth);
  const bins = data.map(val => {
    const bin = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
    return bin;
  });

  return { bins, edges };
}

/**
 * One-Hot Encoding
 */
export function oneHotEncode(categories: (string | number)[]): number[][] {
  const uniqueCategories = Array.from(new Set(categories));
  const categoryMap = new Map(uniqueCategories.map((cat, i) => [cat, i]));

  return categories.map(cat => {
    const encoded = new Array(uniqueCategories.length).fill(0);
    encoded[categoryMap.get(cat)!] = 1;
    return encoded;
  });
}

/**
 * Label Encoding
 */
export function labelEncode(categories: (string | number)[]): { encoded: number[]; mapping: Map<string | number, number> } {
  const uniqueCategories = Array.from(new Set(categories));
  const mapping = new Map(uniqueCategories.map((cat, i) => [cat, i]));
  const encoded = categories.map(cat => mapping.get(cat)!);

  return { encoded, mapping };
}

/**
 * Polynomial Features
 */
export function polynomialFeatures(data: number[][], degree: number = 2): number[][] {
  return data.map(row => {
    const features: number[] = [...row];

    for (let d = 2; d <= degree; d++) {
      for (let i = 0; i < row.length; i++) {
        features.push(Math.pow(row[i], d));
      }
    }

    return features;
  });
}

/**
 * Missing Value Imputation
 */
export function imputeMissing(
  data: (number | null)[],
  strategy: 'mean' | 'median' | 'mode' | 'forward' | 'backward' = 'mean'
): number[] {
  const validValues = data.filter(val => val !== null) as number[];

  let fillValue: number;

  switch (strategy) {
    case 'mean':
      fillValue = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      break;
    case 'median':
      const sorted = [...validValues].sort((a, b) => a - b);
      fillValue = sorted[Math.floor(sorted.length / 2)];
      break;
    case 'mode':
      const counts = new Map<number, number>();
      validValues.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
      fillValue = Array.from(counts.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      break;
    default:
      fillValue = validValues[0] || 0;
  }

  const result: number[] = [];
  let lastValid = fillValue;

  for (const val of data) {
    if (val !== null) {
      result.push(val);
      lastValid = val;
    } else {
      if (strategy === 'forward') {
        result.push(lastValid);
      } else if (strategy === 'backward') {
        // Find next valid value
        const nextIndex = data.slice(result.length).findIndex(v => v !== null);
        result.push(nextIndex >= 0 ? data[result.length + nextIndex]! : lastValid);
      } else {
        result.push(fillValue);
      }
    }
  }

  return result;
}

/**
 * Smooth Data (Moving Average)
 */
export function smoothData(data: number[], window: number = 3): number[] {
  const result: number[] = [];
  const halfWindow = Math.floor(window / 2);

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(data.length, i + halfWindow + 1);
    const windowData = data.slice(start, end);
    const avg = windowData.reduce((a, b) => a + b, 0) / windowData.length;
    result.push(avg);
  }

  return result;
}

/**
 * Downsample Data
 */
export function downsample(data: number[], factor: number): number[] {
  return data.filter((_, i) => i % factor === 0);
}

/**
 * Upsample Data (Linear Interpolation)
 */
export function upsample(data: number[], factor: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length - 1; i++) {
    result.push(data[i]);

    for (let j = 1; j < factor; j++) {
      const ratio = j / factor;
      const interpolated = data[i] * (1 - ratio) + data[i + 1] * ratio;
      result.push(interpolated);
    }
  }

  result.push(data[data.length - 1]);

  return result;
}

/**
 * Remove Duplicates
 */
export function removeDuplicates<T>(data: T[]): T[] {
  return Array.from(new Set(data));
}

/**
 * Clamp Values
 */
export function clamp(data: number[], min: number, max: number): number[] {
  return data.map(val => Math.max(min, Math.min(max, val)));
}

/**
 * Pivot Table
 */
export function pivotTable(
  data: Record<string, any>[],
  rowKey: string,
  colKey: string,
  valueKey: string,
  aggFunc: (values: number[]) => number = vals => vals.reduce((a, b) => a + b, 0)
): Record<string, Record<string, number>> {
  const pivot: Record<string, Record<string, number>> = {};

  data.forEach(row => {
    const rowVal = row[rowKey];
    const colVal = row[colKey];
    const value = parseFloat(row[valueKey]) || 0;

    if (!pivot[rowVal]) {
      pivot[rowVal] = {};
    }

    if (!pivot[rowVal][colVal]) {
      pivot[rowVal][colVal] = value;
    } else {
      // Apply aggregation function
      pivot[rowVal][colVal] = aggFunc([pivot[rowVal][colVal], value]);
    }
  });

  return pivot;
}
