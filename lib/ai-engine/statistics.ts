import {
  StatisticalResult,
  TrendAnalysis,
  CorrelationResult,
  AnomalyDetectionResult,
  TimeSeriesPoint,
} from './types';

/**
 * Advanced Statistical Analysis Module
 * Provides comprehensive statistical methods for health data analysis
 */
export class AdvancedStatistics {
  /**
   * Comprehensive descriptive statistics
   */
  static describe(data: number[]): StatisticalResult {
    if (data.length === 0) {
      throw new Error('Cannot compute statistics on empty dataset');
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Standard deviation
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Median
    const median =
      n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    // Percentiles
    const percentile25 = this.getPercentile(sorted, 0.25);
    const percentile75 = this.getPercentile(sorted, 0.75);
    const iqr = percentile75 - percentile25;

    // Skewness (measure of asymmetry)
    const skewness =
      (data.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / n) / Math.pow(stdDev, 3);

    // Kurtosis (measure of tail heaviness)
    const kurtosis =
      (data.reduce((sum, val) => sum + Math.pow(val - mean, 4), 0) / n) /
        Math.pow(variance, 2) -
      3;

    return {
      mean,
      median,
      stdDev,
      min: sorted[0],
      max: sorted[n - 1],
      percentile25,
      percentile75,
      iqr,
      skewness,
      kurtosis,
    };
  }

  /**
   * Linear regression with statistical significance testing
   */
  static linearRegression(xData: number[], yData: number[]): TrendAnalysis {
    if (xData.length !== yData.length || xData.length < 3) {
      throw new Error('Need at least 3 paired data points for regression');
    }

    const n = xData.length;
    const sumX = xData.reduce((a, b) => a + b, 0);
    const sumY = yData.reduce((a, b) => a + b, 0);
    const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
    const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = yData.reduce((sum, y) => sum + y * y, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;

    // Slope and intercept
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = meanY - slope * meanX;

    // R-squared
    const predictions = xData.map(x => slope * x + intercept);
    const ssResidual = predictions.reduce((sum, pred, i) => sum + Math.pow(yData[i] - pred, 2), 0);
    const ssTotal = yData.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const rSquared = 1 - ssResidual / ssTotal;

    // Standard error and t-statistic for slope
    const standardError = Math.sqrt(ssResidual / (n - 2)) / Math.sqrt(sumX2 - (sumX * sumX) / n);
    const tStatistic = slope / standardError;

    // P-value (approximate using t-distribution)
    const pValue = this.tTestPValue(Math.abs(tStatistic), n - 2);

    // Confidence interval for slope (95%)
    const tCritical = this.getTCritical(0.05, n - 2);
    const marginOfError = tCritical * standardError;
    const confidenceInterval = {
      lower: slope - marginOfError,
      upper: slope + marginOfError,
    };

    // Interpretation
    const significant = pValue < 0.05;
    const absSlope = Math.abs(slope);
    const direction: 'improving' | 'declining' | 'stable' =
      !significant ? 'stable' : slope > 0 ? 'improving' : 'declining';

    const strength: 'strong' | 'moderate' | 'weak' =
      absSlope > 1.0 ? 'strong' : absSlope > 0.3 ? 'moderate' : 'weak';

    return {
      slope,
      intercept,
      rSquared,
      pValue,
      significant,
      direction,
      strength,
      confidenceInterval,
    };
  }

  /**
   * Pearson correlation with significance testing
   */
  static correlation(x: number[], y: number[]): CorrelationResult {
    if (x.length !== y.length || x.length < 3) {
      throw new Error('Need at least 3 paired points for correlation');
    }

    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    const deviationsX = x.map(val => val - meanX);
    const deviationsY = y.map(val => val - meanY);

    const covariance = deviationsX.reduce((sum, dx, i) => sum + dx * deviationsY[i], 0) / n;
    const stdX = Math.sqrt(deviationsX.reduce((sum, dx) => sum + dx * dx, 0) / n);
    const stdY = Math.sqrt(deviationsY.reduce((sum, dy) => sum + dy * dy, 0) / n);

    const coefficient = covariance / (stdX * stdY);

    // T-statistic for correlation
    const tStatistic = (coefficient * Math.sqrt(n - 2)) / Math.sqrt(1 - coefficient * coefficient);
    const pValue = this.tTestPValue(Math.abs(tStatistic), n - 2);

    const significant = pValue < 0.05;

    // Strength interpretation
    const absR = Math.abs(coefficient);
    const strength: CorrelationResult['strength'] =
      absR >= 0.8
        ? 'very_strong'
        : absR >= 0.6
        ? 'strong'
        : absR >= 0.4
        ? 'moderate'
        : absR >= 0.2
        ? 'weak'
        : 'negligible';

    const interpretation = `${strength} ${coefficient >= 0 ? 'positive' : 'negative'} correlation`;

    return {
      coefficient,
      pValue,
      significant,
      strength,
      interpretation,
    };
  }

  /**
   * Z-score based anomaly detection with adaptive thresholding
   */
  static detectAnomalies(data: number[], threshold: number = 2.5): AnomalyDetectionResult {
    if (data.length < 5) {
      return { anomalies: [], totalAnomalies: 0, anomalyRate: 0 };
    }

    const stats = this.describe(data);
    const { mean, stdDev } = stats;

    const anomalies = data
      .map((value, index) => {
        const zScore = (value - mean) / stdDev;
        const absZScore = Math.abs(zScore);

        if (absZScore > threshold) {
          return {
            date: '', // Will be filled by caller with actual dates
            value,
            zScore,
            severity: (absZScore > 3.5 ? 'extreme' : absZScore > 3.0 ? 'moderate' : 'mild') as
              | 'extreme'
              | 'moderate'
              | 'mild',
            type: (zScore > 0 ? 'high' : 'low') as 'high' | 'low',
            index,
          };
        }
        return null;
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);

    return {
      anomalies,
      totalAnomalies: anomalies.length,
      anomalyRate: anomalies.length / data.length,
    };
  }

  /**
   * Isolation Forest-inspired outlier detection
   * Simplified version suitable for small datasets
   */
  static isolationOutliers(
    data: number[],
    contaminationFactor: number = 0.1
  ): { outlierIndices: number[]; scores: number[] } {
    if (data.length < 10) {
      return { outlierIndices: [], scores: [] };
    }

    // Calculate isolation scores based on data density
    const scores = data.map((value, idx) => {
      // Count how many neighbors are within 1 std dev
      const stats = this.describe(data);
      const neighbors = data.filter(
        v => Math.abs(v - value) <= stats.stdDev && v !== value
      ).length;

      // Isolation score: fewer neighbors = higher score (more isolated)
      return 1 / (neighbors + 1);
    });

    // Determine threshold based on contamination factor
    const sortedScores = [...scores].sort((a, b) => b - a);
    const thresholdIndex = Math.floor(data.length * contaminationFactor);
    const threshold = sortedScores[thresholdIndex];

    const outlierIndices = scores
      .map((score, idx) => (score >= threshold ? idx : -1))
      .filter(idx => idx !== -1);

    return { outlierIndices, scores };
  }

  /**
   * Change point detection using cumulative sum (CUSUM) method
   */
  static detectChangePoints(
    data: number[],
    threshold: number = 3
  ): { changePoints: number[]; significance: number[] } {
    if (data.length < 10) {
      return { changePoints: [], significance: [] };
    }

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

    let cusumPos = 0;
    let cusumNeg = 0;
    const cusumValues: number[] = [];
    const changePoints: number[] = [];
    const significance: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const deviation = (data[i] - mean) / stdDev;

      cusumPos = Math.max(0, cusumPos + deviation - 0.5);
      cusumNeg = Math.min(0, cusumNeg + deviation + 0.5);

      cusumValues.push(Math.max(Math.abs(cusumPos), Math.abs(cusumNeg)));

      // Detect change point if CUSUM exceeds threshold
      if (cusumValues[i] > threshold && i > 0) {
        changePoints.push(i);
        significance.push(cusumValues[i]);
        cusumPos = 0;
        cusumNeg = 0;
      }
    }

    return { changePoints, significance };
  }

  /**
   * Moving average (simple or exponential)
   */
  static movingAverage(
    data: number[],
    window: number,
    type: 'simple' | 'exponential' = 'simple'
  ): number[] {
    if (type === 'simple') {
      return data.map((_, idx) => {
        const start = Math.max(0, idx - window + 1);
        const windowData = data.slice(start, idx + 1);
        return windowData.reduce((a, b) => a + b, 0) / windowData.length;
      });
    } else {
      // Exponential moving average
      const alpha = 2 / (window + 1);
      const ema: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) {
        ema.push(alpha * data[i] + (1 - alpha) * ema[i - 1]);
      }
      return ema;
    }
  }

  /**
   * Autocorrelation function for detecting periodicity
   */
  static autocorrelation(data: number[], maxLag: number = 14): number[] {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);

    const autocorr: number[] = [];

    for (let lag = 0; lag <= maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < data.length - lag; i++) {
        sum += (data[i] - mean) * (data[i + lag] - mean);
      }
      autocorr.push(sum / variance);
    }

    return autocorr;
  }

  /**
   * Seasonal decomposition (simplified STL)
   */
  static seasonalDecomposition(
    data: number[],
    period: number = 7
  ): {
    trend: number[];
    seasonal: number[];
    residual: number[];
  } {
    // Trend: moving average
    const trend = this.movingAverage(data, period, 'simple');

    // Detrend
    const detrended = data.map((val, i) => val - trend[i]);

    // Seasonal: average for each position in period
    const seasonal = data.map((_, idx) => {
      const phase = idx % period;
      const values = detrended.filter((_, i) => i % period === phase);
      return values.reduce((a, b) => a + b, 0) / values.length;
    });

    // Residual
    const residual = data.map((val, i) => val - trend[i] - seasonal[i]);

    return { trend, seasonal, residual };
  }

  // ==================== HELPER METHODS ====================

  private static getPercentile(sorted: number[], p: number): number {
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  private static tTestPValue(tStatistic: number, degreesOfFreedom: number): number {
    // Approximate p-value calculation for t-distribution
    // Using Wilson-Hilferty transformation for better accuracy
    const x = degreesOfFreedom / (degreesOfFreedom + tStatistic * tStatistic);
    const p = 0.5 * this.incompleteBeta(x, degreesOfFreedom / 2, 0.5);
    return 2 * p; // two-tailed
  }

  private static incompleteBeta(x: number, a: number, b: number): number {
    // Simplified incomplete beta function for p-value approximation
    // This is a rough approximation suitable for our use case
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    const lnBeta = this.logGamma(a) + this.logGamma(b) - this.logGamma(a + b);
    let sum = 0;
    let term = 1;

    for (let k = 0; k < 100; k++) {
      term *= ((a + k) * x) / (1 + k);
      sum += term / (a + k);
      if (Math.abs(term / sum) < 1e-10) break;
    }

    return (sum * Math.pow(x, a)) / Math.exp(lnBeta);
  }

  private static logGamma(x: number): number {
    // Stirling's approximation
    const coefficients = [
      76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
      0.001208650973866179, -0.000005395239384953,
    ];

    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;

    for (let j = 0; j < 6; j++) {
      ser += coefficients[j] / ++y;
    }

    return -tmp + Math.log((2.5066282746310005 * ser) / x);
  }

  private static getTCritical(alpha: number, df: number): number {
    // Approximate t-critical values for common cases
    // For 95% CI (alpha = 0.05)
    if (df === 1) return 12.706;
    if (df === 2) return 4.303;
    if (df <= 5) return 2.571;
    if (df <= 10) return 2.228;
    if (df <= 20) return 2.086;
    if (df <= 30) return 2.042;
    return 1.96; // approximate normal for large df
  }

  /**
   * Calculate coefficient of variation (CV)
   */
  static coefficientOfVariation(data: number[]): number {
    const stats = this.describe(data);
    return (stats.stdDev / stats.mean) * 100;
  }

  /**
   * Calculate rolling statistics
   */
  static rollingStatistics(
    data: number[],
    window: number
  ): Array<{ mean: number; stdDev: number; min: number; max: number }> {
    return data.map((_, idx) => {
      const start = Math.max(0, idx - window + 1);
      const windowData = data.slice(start, idx + 1);
      const stats = this.describe(windowData);
      return {
        mean: stats.mean,
        stdDev: stats.stdDev,
        min: stats.min,
        max: stats.max,
      };
    });
  }
}
