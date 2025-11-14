/**
 * Survival Analysis and Time-to-Event Modeling
 * Kaplan-Meier, Cox Proportional Hazards, and more
 */

export interface SurvivalData {
  time: number;
  event: boolean; // true = event occurred, false = censored
  covariates?: number[];
}

export interface KaplanMeierResult {
  times: number[];
  survival: number[];
  events: number[];
  atRisk: number[];
  confidenceInterval: Array<{ lower: number; upper: number }>;
  medianSurvival: number;
}

export interface CoxPHResult {
  coefficients: number[];
  hazardRatios: number[];
  standardErrors: number[];
  zScores: number[];
  pValues: number[];
  concordanceIndex: number;
}

export class SurvivalAnalysis {
  /**
   * Kaplan-Meier survival curve estimation
   */
  kaplanMeier(data: SurvivalData[], confidenceLevel: number = 0.95): KaplanMeierResult {
    // Sort by time
    const sorted = [...data].sort((a, b) => a.time - b.time);

    const times: number[] = [];
    const survival: number[] = [];
    const events: number[] = [];
    const atRisk: number[] = [];
    const confidenceInterval: Array<{ lower: number; upper: number }> = [];

    let currentSurvival = 1.0;
    let n = sorted.length;
    let i = 0;

    while (i < sorted.length) {
      const currentTime = sorted[i].time;
      let eventCount = 0;
      let censorCount = 0;

      // Count events and censored observations at current time
      while (i < sorted.length && sorted[i].time === currentTime) {
        if (sorted[i].event) {
          eventCount++;
        } else {
          censorCount++;
        }
        i++;
      }

      if (eventCount > 0) {
        currentSurvival *= (n - eventCount) / n;

        times.push(currentTime);
        survival.push(currentSurvival);
        events.push(eventCount);
        atRisk.push(n);

        // Greenwood's formula for variance
        const variance = this.greenwoodVariance(survival.length - 1, events, atRisk);
        const se = Math.sqrt(variance) * currentSurvival;

        // Confidence interval using log-log transformation
        const z = this.normalQuantile((1 + confidenceLevel) / 2);
        const theta = Math.exp(z * se / (currentSurvival * Math.log(currentSurvival || 1)));

        confidenceInterval.push({
          lower: Math.pow(currentSurvival, theta),
          upper: Math.pow(currentSurvival, 1 / theta),
        });
      }

      n -= (eventCount + censorCount);
    }

    // Find median survival time
    const medianSurvival = this.findMedianSurvival(times, survival);

    return {
      times,
      survival,
      events,
      atRisk,
      confidenceInterval,
      medianSurvival,
    };
  }

  /**
   * Greenwood's variance formula
   */
  private greenwoodVariance(index: number, events: number[], atRisk: number[]): number {
    let variance = 0;
    for (let i = 0; i <= index; i++) {
      if (atRisk[i] > 0 && atRisk[i] - events[i] > 0) {
        variance += events[i] / (atRisk[i] * (atRisk[i] - events[i]));
      }
    }
    return variance;
  }

  /**
   * Find median survival time
   */
  private findMedianSurvival(times: number[], survival: number[]): number {
    for (let i = 0; i < survival.length; i++) {
      if (survival[i] <= 0.5) {
        return times[i];
      }
    }
    return Infinity;
  }

  /**
   * Log-rank test to compare survival curves
   */
  logRankTest(group1: SurvivalData[], group2: SurvivalData[]): {
    statistic: number;
    pValue: number;
    reject: boolean;
  } {
    // Combine all unique event times
    const allTimes = [
      ...new Set([...group1, ...group2].map(d => d.time))
    ].sort((a, b) => a - b);

    let chiSquare = 0;
    let variance = 0;

    for (const time of allTimes) {
      // Count events and at-risk in each group
      const g1Events = group1.filter(d => d.time === time && d.event).length;
      const g2Events = group2.filter(d => d.time === time && d.event).length;
      const g1AtRisk = group1.filter(d => d.time >= time).length;
      const g2AtRisk = group2.filter(d => d.time >= time).length;

      const totalEvents = g1Events + g2Events;
      const totalAtRisk = g1AtRisk + g2AtRisk;

      if (totalAtRisk === 0) continue;

      // Expected events in group 1
      const expected = (g1AtRisk / totalAtRisk) * totalEvents;

      // Contribution to test statistic
      chiSquare += g1Events - expected;

      // Contribution to variance
      if (totalAtRisk > 1) {
        variance += (g1AtRisk * g2AtRisk * totalEvents * (totalAtRisk - totalEvents)) /
                    (totalAtRisk * totalAtRisk * (totalAtRisk - 1));
      }
    }

    const statistic = (chiSquare * chiSquare) / (variance || 1);
    const pValue = 1 - this.chiSquareCDF(statistic, 1);
    const reject = pValue < 0.05;

    return { statistic, pValue, reject };
  }

  /**
   * Cox Proportional Hazards Model
   */
  coxPH(data: SurvivalData[], maxIterations: number = 100): CoxPHResult {
    if (!data[0].covariates) {
      throw new Error('Covariates required for Cox PH model');
    }

    const n = data.length;
    const p = data[0].covariates.length;

    // Sort by time
    const sorted = [...data].sort((a, b) => a.time - b.time);

    // Initialize coefficients
    let beta = new Array(p).fill(0);

    // Newton-Raphson iterations
    for (let iter = 0; iter < maxIterations; iter++) {
      const { gradient, hessian } = this.coxPartialLikelihood(sorted, beta);

      // Newton-Raphson update
      const delta = this.solveLinearSystem(hessian, gradient);

      // Update coefficients
      beta = beta.map((b, i) => b - delta[i]);

      // Check convergence
      const maxChange = Math.max(...delta.map(Math.abs));
      if (maxChange < 1e-6) break;
    }

    // Calculate standard errors, z-scores, and p-values
    const { hessian } = this.coxPartialLikelihood(sorted, beta);
    const covariance = this.invertMatrix(hessian.map(row => row.map(x => -x)));
    const standardErrors = covariance.map((row, i) => Math.sqrt(Math.abs(row[i])));

    const zScores = beta.map((b, i) => b / standardErrors[i]);
    const pValues = zScores.map(z => 2 * (1 - this.normalCDF(Math.abs(z))));
    const hazardRatios = beta.map(b => Math.exp(b));

    // Calculate concordance index (C-index)
    const concordanceIndex = this.calculateConcordance(sorted, beta);

    return {
      coefficients: beta,
      hazardRatios,
      standardErrors,
      zScores,
      pValues,
      concordanceIndex,
    };
  }

  /**
   * Cox partial likelihood gradient and Hessian
   */
  private coxPartialLikelihood(
    data: SurvivalData[],
    beta: number[]
  ): { gradient: number[]; hessian: number[][] } {
    const n = data.length;
    const p = beta.length;

    const gradient = new Array(p).fill(0);
    const hessian = Array(p).fill(0).map(() => Array(p).fill(0));

    for (let i = 0; i < n; i++) {
      if (!data[i].event) continue;

      const xi = data[i].covariates!;
      const ti = data[i].time;

      // Risk set: all subjects with time >= ti
      const riskSet = data.filter(d => d.time >= ti);

      // Calculate weighted sums
      let sumRisk = 0;
      const sumX = new Array(p).fill(0);
      const sumXX = Array(p).fill(0).map(() => Array(p).fill(0));

      for (const d of riskSet) {
        const xj = d.covariates!;
        const risk = Math.exp(this.dotProduct(beta, xj));
        sumRisk += risk;

        for (let k = 0; k < p; k++) {
          sumX[k] += risk * xj[k];
          for (let l = 0; l < p; l++) {
            sumXX[k][l] += risk * xj[k] * xj[l];
          }
        }
      }

      // Update gradient and Hessian
      for (let k = 0; k < p; k++) {
        gradient[k] += xi[k] - sumX[k] / sumRisk;

        for (let l = 0; l < p; l++) {
          hessian[k][l] -= sumXX[k][l] / sumRisk -
                          (sumX[k] * sumX[l]) / (sumRisk * sumRisk);
        }
      }
    }

    return { gradient, hessian };
  }

  /**
   * Calculate concordance index (C-index)
   */
  private calculateConcordance(data: SurvivalData[], beta: number[]): number {
    let concordant = 0;
    let discordant = 0;
    let tied = 0;

    for (let i = 0; i < data.length; i++) {
      if (!data[i].event) continue;

      const xi = data[i].covariates!;
      const ti = data[i].time;
      const scorei = this.dotProduct(beta, xi);

      for (let j = 0; j < data.length; j++) {
        if (i === j || data[j].time <= ti) continue;

        const xj = data[j].covariates!;
        const scorej = this.dotProduct(beta, xj);

        if (scorei > scorej) {
          concordant++;
        } else if (scorei < scorej) {
          discordant++;
        } else {
          tied++;
        }
      }
    }

    return (concordant + 0.5 * tied) / (concordant + discordant + tied || 1);
  }

  /**
   * Weibull survival model
   */
  weibullSurvival(
    data: SurvivalData[]
  ): {
    shape: number;
    scale: number;
    survivalFunction: (t: number) => number;
    hazardFunction: (t: number) => number;
  } {
    // Maximum likelihood estimation for Weibull parameters
    const sorted = data.filter(d => d.event).map(d => d.time).sort((a, b) => a - b);

    if (sorted.length === 0) {
      throw new Error('No events observed');
    }

    // Initial guess
    let shape = 1.0;
    let scale = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    // Newton-Raphson iterations
    for (let iter = 0; iter < 50; iter++) {
      let sumLogT = 0;
      let sumTk = 0;
      let sumTkLogT = 0;

      for (const t of sorted) {
        const tk = Math.pow(t, shape);
        sumLogT += Math.log(t);
        sumTk += tk;
        sumTkLogT += tk * Math.log(t);
      }

      const n = sorted.length;
      const newShape = shape + (n / shape - sumLogT + sumTkLogT / sumTk) /
                              (-n / (shape * shape) + sumTkLogT * sumTkLogT / (sumTk * sumTk));

      if (Math.abs(newShape - shape) < 1e-6) break;
      shape = newShape;
      scale = Math.pow(sumTk / n, 1 / shape);
    }

    const survivalFunction = (t: number) =>
      Math.exp(-Math.pow(t / scale, shape));

    const hazardFunction = (t: number) =>
      (shape / scale) * Math.pow(t / scale, shape - 1);

    return { shape, scale, survivalFunction, hazardFunction };
  }

  // Helper functions

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);

    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Partial pivoting
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Forward elimination
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / (augmented[i][i] || 1e-10);
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i] || 1e-10;
    }

    return x;
  }

  private invertMatrix(matrix: number[][]): number[][] {
    const n = matrix.length;
    const identity = Array(n).fill(0).map((_, i) =>
      Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    );

    const augmented = matrix.map((row, i) => [...row, ...identity[i]]);

    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / (augmented[i][i] || 1e-10);
        for (let j = i; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    for (let i = n - 1; i >= 0; i--) {
      for (let k = i - 1; k >= 0; k--) {
        const factor = augmented[k][i] / (augmented[i][i] || 1e-10);
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const divisor = augmented[i][i] || 1e-10;
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= divisor;
      }
    }

    return augmented.map(row => row.slice(n));
  }

  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.SQRT2));
  }

  private erf(x: number): number {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private normalQuantile(p: number): number {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;

    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
               1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
               6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
               -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
               3.754408661907416e+00];

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q: number, r: number;

    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }

    if (p > pHigh) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }

    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  private chiSquareCDF(x: number, df: number): number {
    if (x <= 0) return 0;

    let sum = 0;
    let term = 1;
    for (let k = 0; k < 100; k++) {
      sum += term;
      term *= x / (2 * (k + 1));
      if (term < 1e-10) break;
    }

    return 1 - Math.exp(-x / 2) * sum * Math.pow(x / 2, df / 2 - 1);
  }
}
