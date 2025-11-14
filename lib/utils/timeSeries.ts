/**
 * Time series analysis utilities
 */

export interface TimeSeriesPoint {
  timestamp: Date | string;
  value: number;
}

export interface Forecast {
  timestamp: Date;
  predicted: number;
  confidence?: {
    lower: number;
    upper: number;
  };
}

/**
 * Calculate simple moving average
 */
export function simpleMovingAverage(data: number[], window: number): number[] {
  if (window <= 0 || window > data.length) {
    throw new Error('Invalid window size');
  }

  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  return result;
}

/**
 * Calculate exponential moving average
 */
export function exponentialMovingAverage(data: number[], alpha: number): number[] {
  if (alpha <= 0 || alpha > 1) {
    throw new Error('Alpha must be between 0 and 1');
  }

  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(ema);
  }
  return result;
}

/**
 * Detect trend direction
 */
export function detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable';

  // Linear regression
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (data[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = numerator / denominator;

  if (Math.abs(slope) < 0.1) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
}

/**
 * Calculate rate of change
 */
export function calculateRateOfChange(data: number[], periods = 1): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < periods) {
      result.push(NaN);
    } else {
      const change = ((data[i] - data[i - periods]) / data[i - periods]) * 100;
      result.push(change);
    }
  }
  return result;
}

/**
 * Simple linear regression for forecasting
 */
export function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (data[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
}

/**
 * Forecast future values using linear regression
 */
export function forecastLinear(data: number[], periods: number): number[] {
  const { slope, intercept } = linearRegression(data);
  const forecast: number[] = [];
  
  for (let i = 0; i < periods; i++) {
    const x = data.length + i;
    forecast.push(slope * x + intercept);
  }

  return forecast;
}

/**
 * Detect seasonality (simple day-of-week pattern)
 */
export function detectSeasonality(data: TimeSeriesPoint[]): Record<number, number> {
  const dayAverages: Record<number, number[]> = {};

  data.forEach((point) => {
    const date = new Date(point.timestamp);
    const dayOfWeek = date.getDay();
    
    if (!dayAverages[dayOfWeek]) {
      dayAverages[dayOfWeek] = [];
    }
    dayAverages[dayOfWeek].push(point.value);
  });

  const seasonality: Record<number, number> = {};
  Object.keys(dayAverages).forEach((day) => {
    const values = dayAverages[Number(day)];
    seasonality[Number(day)] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });

  return seasonality;
}

/**
 * Smooth time series data using Gaussian filter
 */
export function gaussianSmooth(data: number[], sigma: number): number[] {
  const kernel = createGaussianKernel(sigma);
  return convolve(data, kernel);
}

function createGaussianKernel(sigma: number): number[] {
  const size = Math.ceil(sigma * 3) * 2 + 1;
  const kernel: number[] = [];
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - Math.floor(size / 2);
    const value = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel.push(value);
    sum += value;
  }

  return kernel.map((val) => val / sum);
}

function convolve(data: number[], kernel: number[]): number[] {
  const result: number[] = [];
  const halfKernel = Math.floor(kernel.length / 2);

  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let weightSum = 0;

    for (let j = 0; j < kernel.length; j++) {
      const dataIndex = i - halfKernel + j;
      if (dataIndex >= 0 && dataIndex < data.length) {
        sum += data[dataIndex] * kernel[j];
        weightSum += kernel[j];
      }
    }

    result.push(sum / weightSum);
  }

  return result;
}
