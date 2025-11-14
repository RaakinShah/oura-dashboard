/**
 * Time Series Forecasting using ARIMA-like approach
 */

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

export class TimeSeriesForecast {
  private data: TimeSeriesData[];
  private seasonality: number;

  constructor(seasonality: number = 7) {
    this.data = [];
    this.seasonality = seasonality;
  }

  addData(data: TimeSeriesData[]) {
    this.data = [...this.data, ...data].sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Simple Moving Average
   */
  movingAverage(window: number): number[] {
    const result: number[] = [];
    
    for (let i = window - 1; i < this.data.length; i++) {
      let sum = 0;
      for (let j = 0; j < window; j++) {
        sum += this.data[i - j].value;
      }
      result.push(sum / window);
    }
    
    return result;
  }

  /**
   * Exponential Moving Average
   */
  exponentialMovingAverage(alpha: number = 0.3): number[] {
    const result: number[] = [this.data[0].value];
    
    for (let i = 1; i < this.data.length; i++) {
      const ema = alpha * this.data[i].value + (1 - alpha) * result[i - 1];
      result.push(ema);
    }
    
    return result;
  }

  /**
   * Linear regression forecast
   */
  linearForecast(steps: number): number[] {
    const n = this.data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += this.data[i].value;
      sumXY += i * this.data[i].value;
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: number[] = [];
    for (let i = 0; i < steps; i++) {
      forecast.push(slope * (n + i) + intercept);
    }

    return forecast;
  }

  /**
   * Seasonal decomposition
   */
  decomposeSeasonality(): { trend: number[]; seasonal: number[]; residual: number[] } {
    const ma = this.movingAverage(this.seasonality);
    const trend: number[] = [];
    const seasonal: number[] = [];
    const residual: number[] = [];

    // Calculate trend (moving average)
    const offset = Math.floor(this.seasonality / 2);
    for (let i = 0; i < this.data.length; i++) {
      if (i < offset || i >= this.data.length - offset) {
        trend.push(this.data[i].value);
      } else {
        trend.push(ma[i - offset]);
      }
    }

    // Calculate seasonal component
    const seasonalAverages: number[] = new Array(this.seasonality).fill(0);
    const seasonalCounts: number[] = new Array(this.seasonality).fill(0);

    for (let i = 0; i < this.data.length; i++) {
      const seasonalIndex = i % this.seasonality;
      const detrended = this.data[i].value - trend[i];
      seasonalAverages[seasonalIndex] += detrended;
      seasonalCounts[seasonalIndex]++;
    }

    for (let i = 0; i < this.seasonality; i++) {
      seasonalAverages[i] /= seasonalCounts[i];
    }

    for (let i = 0; i < this.data.length; i++) {
      seasonal.push(seasonalAverages[i % this.seasonality]);
      residual.push(this.data[i].value - trend[i] - seasonal[i]);
    }

    return { trend, seasonal, residual };
  }

  /**
   * Holt-Winters forecasting
   */
  holtWintersForecast(steps: number, alpha: number = 0.3, beta: number = 0.1, gamma: number = 0.1): number[] {
    const { trend, seasonal } = this.decomposeSeasonality();
    
    let level = this.data[0].value;
    let trendComponent = 0;
    const seasonalComponents = seasonal.slice(0, this.seasonality);

    const forecast: number[] = [];

    // Update components with historical data
    for (let i = 1; i < this.data.length; i++) {
      const prevLevel = level;
      const seasonalIndex = i % this.seasonality;

      level = alpha * (this.data[i].value - seasonalComponents[seasonalIndex]) + 
              (1 - alpha) * (prevLevel + trendComponent);
      
      trendComponent = beta * (level - prevLevel) + (1 - beta) * trendComponent;
      
      seasonalComponents[seasonalIndex] = gamma * (this.data[i].value - level) + 
                                          (1 - gamma) * seasonalComponents[seasonalIndex];
    }

    // Generate forecast
    for (let i = 0; i < steps; i++) {
      const seasonalIndex = (this.data.length + i) % this.seasonality;
      const forecastValue = level + (i + 1) * trendComponent + seasonalComponents[seasonalIndex];
      forecast.push(forecastValue);
    }

    return forecast;
  }

  /**
   * Detect anomalies using statistical methods
   */
  detectAnomalies(threshold: number = 2): { index: number; value: number; score: number }[] {
    const values = this.data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: { index: number; value: number; score: number }[] = [];

    for (let i = 0; i < values.length; i++) {
      const zScore = Math.abs((values[i] - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push({
          index: i,
          value: values[i],
          score: zScore,
        });
      }
    }

    return anomalies;
  }
}
