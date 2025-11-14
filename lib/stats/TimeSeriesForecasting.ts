/**
 * Time Series Forecasting
 * Implements ARIMA, exponential smoothing, and trend analysis
 */

export interface ForecastResult {
  forecast: number[];
  confidence: { lower: number[]; upper: number[] };
  trend?: number[];
  seasonal?: number[];
  residuals?: number[];
}

export interface TrendAnalysis {
  slope: number;
  intercept: number;
  r2: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
}

export class TimeSeriesForecasting {
  /**
   * Simple Exponential Smoothing
   */
  exponentialSmoothing(
    data: number[],
    alpha: number = 0.3,
    forecastSteps: number = 10
  ): ForecastResult {
    const n = data.length;
    const smoothed: number[] = [data[0]];

    // Calculate smoothed values
    for (let i = 1; i < n; i++) {
      smoothed[i] = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
    }

    // Forecast future values
    const forecast: number[] = [];
    let lastSmoothed = smoothed[n - 1];

    for (let i = 0; i < forecastSteps; i++) {
      forecast.push(lastSmoothed);
    }

    // Calculate prediction intervals
    const residuals = data.map((val, i) => val - smoothed[i]);
    const stdDev = this.standardDeviation(residuals);

    return {
      forecast,
      confidence: {
        lower: forecast.map(f => f - 1.96 * stdDev),
        upper: forecast.map(f => f + 1.96 * stdDev),
      },
      residuals,
    };
  }

  /**
   * Double Exponential Smoothing (Holt's method)
   */
  doubleExponentialSmoothing(
    data: number[],
    alpha: number = 0.3,
    beta: number = 0.1,
    forecastSteps: number = 10
  ): ForecastResult {
    const n = data.length;
    let level = data[0];
    let trend = data[1] - data[0];
    const smoothed: number[] = [level];

    for (let i = 1; i < n; i++) {
      const prevLevel = level;
      level = alpha * data[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      smoothed.push(level);
    }

    // Forecast
    const forecast: number[] = [];
    for (let i = 1; i <= forecastSteps; i++) {
      forecast.push(level + i * trend);
    }

    const residuals = data.map((val, i) => val - smoothed[i]);
    const stdDev = this.standardDeviation(residuals);

    return {
      forecast,
      confidence: {
        lower: forecast.map((f, i) => f - 1.96 * stdDev * Math.sqrt(i + 1)),
        upper: forecast.map((f, i) => f + 1.96 * stdDev * Math.sqrt(i + 1)),
      },
      trend: Array.from({ length: forecastSteps }, (_, i) => (i + 1) * trend),
      residuals,
    };
  }

  /**
   * Moving Average
   */
  movingAverage(
    data: number[],
    window: number,
    weighted: boolean = false
  ): number[] {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(NaN);
        continue;
      }

      const windowData = data.slice(i - window + 1, i + 1);

      if (weighted) {
        // Weighted moving average
        const weights = Array.from({ length: window }, (_, j) => j + 1);
        const weightSum = weights.reduce((a, b) => a + b, 0);
        const wma = windowData.reduce((sum, val, j) => sum + val * weights[j], 0) / weightSum;
        result.push(wma);
      } else {
        // Simple moving average
        const sma = windowData.reduce((a, b) => a + b, 0) / window;
        result.push(sma);
      }
    }

    return result;
  }

  /**
   * Trend Analysis using Linear Regression
   */
  analyzeTrend(data: number[]): TrendAnalysis {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    // Calculate linear regression
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Calculate R²
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    // Determine trend direction and strength
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.01) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    let strength: 'weak' | 'moderate' | 'strong';
    if (r2 < 0.3) {
      strength = 'weak';
    } else if (r2 < 0.7) {
      strength = 'moderate';
    } else {
      strength = 'strong';
    }

    return {
      slope,
      intercept,
      r2,
      trend,
      strength,
    };
  }

  /**
   * Seasonal Decomposition
   */
  seasonalDecompose(
    data: number[],
    period: number
  ): { trend: number[]; seasonal: number[]; residual: number[] } {
    const n = data.length;

    // Calculate trend using centered moving average
    const trend = this.centeredMovingAverage(data, period);

    // Detrend the data
    const detrended = data.map((val, i) =>
      isNaN(trend[i]) ? NaN : val - trend[i]
    );

    // Calculate seasonal component
    const seasonal = new Array(n).fill(0);
    for (let i = 0; i < period; i++) {
      const periodValues = [];
      for (let j = i; j < n; j += period) {
        if (!isNaN(detrended[j])) {
          periodValues.push(detrended[j]);
        }
      }
      const seasonalValue = periodValues.reduce((a, b) => a + b, 0) / periodValues.length;
      for (let j = i; j < n; j += period) {
        seasonal[j] = seasonalValue;
      }
    }

    // Calculate residual
    const residual = data.map((val, i) =>
      isNaN(trend[i]) ? NaN : val - trend[i] - seasonal[i]
    );

    return { trend, seasonal, residual };
  }

  /**
   * Auto-correlation Function
   */
  acf(data: number[], maxLag: number = 20): number[] {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;

    const acf: number[] = [1]; // ACF at lag 0 is always 1

    for (let lag = 1; lag <= maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += (data[i] - mean) * (data[i + lag] - mean);
      }
      acf.push(sum / (n * variance));
    }

    return acf;
  }

  /**
   * Detect Seasonality
   */
  detectSeasonality(data: number[], maxPeriod: number = 30): { hasSeason: boolean; period?: number; strength?: number } {
    const acfValues = this.acf(data, maxPeriod);

    // Find peaks in ACF
    const peaks: { lag: number; value: number }[] = [];
    for (let i = 1; i < acfValues.length - 1; i++) {
      if (acfValues[i] > acfValues[i - 1] && acfValues[i] > acfValues[i + 1] && acfValues[i] > 0.3) {
        peaks.push({ lag: i, value: acfValues[i] });
      }
    }

    if (peaks.length === 0) {
      return { hasSeason: false };
    }

    // Find most prominent peak
    peaks.sort((a, b) => b.value - a.value);
    const strongestPeak = peaks[0];

    return {
      hasSeason: true,
      period: strongestPeak.lag,
      strength: strongestPeak.value,
    };
  }

  /**
   * Centered Moving Average
   */
  private centeredMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    const halfWindow = Math.floor(window / 2);

    for (let i = 0; i < data.length; i++) {
      if (i < halfWindow || i >= data.length - halfWindow) {
        result.push(NaN);
        continue;
      }

      const windowData = data.slice(i - halfWindow, i + halfWindow + 1);
      const avg = windowData.reduce((a, b) => a + b, 0) / windowData.length;
      result.push(avg);
    }

    return result;
  }

  /**
   * Standard Deviation
   */
  private standardDeviation(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }
}
