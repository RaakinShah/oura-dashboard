/**
 * Hypothesis Testing and Statistical Inference
 * Classical and modern statistical tests
 */

export interface TestResult {
  statistic: number;
  pValue: number;
  reject: boolean;
  confidenceInterval?: { lower: number; upper: number };
  effectSize?: number;
  power?: number;
}

export class HypothesisTesting {
  /**
   * One-sample t-test
   */
  oneSampleTTest(
    data: number[],
    mu0: number,
    alpha: number = 0.05,
    alternative: 'two-sided' | 'greater' | 'less' = 'two-sided'
  ): TestResult {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdError = Math.sqrt(variance / n);

    const t = (mean - mu0) / stdError;
    const df = n - 1;

    let pValue: number;
    if (alternative === 'two-sided') {
      pValue = 2 * (1 - this.tCDF(Math.abs(t), df));
    } else if (alternative === 'greater') {
      pValue = 1 - this.tCDF(t, df);
    } else {
      pValue = this.tCDF(t, df);
    }

    const reject = pValue < alpha;

    // Confidence interval
    const tCritical = this.tQuantile(1 - alpha / 2, df);
    const margin = tCritical * stdError;
    const confidenceInterval = {
      lower: mean - margin,
      upper: mean + margin,
    };

    // Cohen's d effect size
    const effectSize = (mean - mu0) / Math.sqrt(variance);

    return {
      statistic: t,
      pValue,
      reject,
      confidenceInterval,
      effectSize,
    };
  }

  /**
   * Two-sample t-test (independent samples)
   */
  twoSampleTTest(
    data1: number[],
    data2: number[],
    alpha: number = 0.05,
    equalVariance: boolean = true
  ): TestResult {
    const n1 = data1.length;
    const n2 = data2.length;

    const mean1 = data1.reduce((a, b) => a + b, 0) / n1;
    const mean2 = data2.reduce((a, b) => a + b, 0) / n2;

    const var1 = data1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
    const var2 = data2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);

    let t: number;
    let df: number;
    let stdError: number;

    if (equalVariance) {
      // Pooled variance
      const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
      stdError = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
      df = n1 + n2 - 2;
    } else {
      // Welch's t-test
      stdError = Math.sqrt(var1 / n1 + var2 / n2);
      df = Math.pow(var1 / n1 + var2 / n2, 2) /
           (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));
    }

    t = (mean1 - mean2) / stdError;
    const pValue = 2 * (1 - this.tCDF(Math.abs(t), df));
    const reject = pValue < alpha;

    // Cohen's d
    const pooledStd = Math.sqrt((var1 + var2) / 2);
    const effectSize = (mean1 - mean2) / pooledStd;

    return {
      statistic: t,
      pValue,
      reject,
      effectSize,
    };
  }

  /**
   * Paired t-test
   */
  pairedTTest(
    data1: number[],
    data2: number[],
    alpha: number = 0.05
  ): TestResult {
    if (data1.length !== data2.length) {
      throw new Error('Paired samples must have equal length');
    }

    const differences = data1.map((val, i) => val - data2[i]);
    return this.oneSampleTTest(differences, 0, alpha);
  }

  /**
   * Chi-square test for independence
   */
  chiSquareTest(
    observed: number[][],
    alpha: number = 0.05
  ): TestResult {
    const rows = observed.length;
    const cols = observed[0].length;

    // Calculate row and column totals
    const rowTotals = observed.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = observed[0].map((_, j) =>
      observed.reduce((sum, row) => sum + row[j], 0)
    );
    const total = rowTotals.reduce((a, b) => a + b, 0);

    // Calculate expected frequencies
    const expected = observed.map((row, i) =>
      row.map((_, j) => (rowTotals[i] * colTotals[j]) / total)
    );

    // Calculate chi-square statistic
    let chiSquare = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        chiSquare += Math.pow(observed[i][j] - expected[i][j], 2) / expected[i][j];
      }
    }

    const df = (rows - 1) * (cols - 1);
    const pValue = 1 - this.chiSquareCDF(chiSquare, df);
    const reject = pValue < alpha;

    // Cramér's V effect size
    const minDim = Math.min(rows - 1, cols - 1);
    const effectSize = Math.sqrt(chiSquare / (total * minDim));

    return {
      statistic: chiSquare,
      pValue,
      reject,
      effectSize,
    };
  }

  /**
   * One-way ANOVA
   */
  anova(
    groups: number[][],
    alpha: number = 0.05
  ): TestResult & {
    betweenGroupVariance: number;
    withinGroupVariance: number;
  } {
    const k = groups.length;
    const n = groups.reduce((sum, group) => sum + group.length, 0);

    // Grand mean
    const grandMean = groups.reduce(
      (sum, group) => sum + group.reduce((a, b) => a + b, 0),
      0
    ) / n;

    // Between-group sum of squares
    const ssb = groups.reduce((sum, group) => {
      const groupMean = group.reduce((a, b) => a + b, 0) / group.length;
      return sum + group.length * Math.pow(groupMean - grandMean, 2);
    }, 0);

    // Within-group sum of squares
    const ssw = groups.reduce((sum, group) => {
      const groupMean = group.reduce((a, b) => a + b, 0) / group.length;
      return sum + group.reduce((s, val) => s + Math.pow(val - groupMean, 2), 0);
    }, 0);

    // Degrees of freedom
    const dfb = k - 1;
    const dfw = n - k;

    // Mean squares
    const msb = ssb / dfb;
    const msw = ssw / dfw;

    // F-statistic
    const f = msb / msw;
    const pValue = 1 - this.fCDF(f, dfb, dfw);
    const reject = pValue < alpha;

    // Eta-squared effect size
    const effectSize = ssb / (ssb + ssw);

    return {
      statistic: f,
      pValue,
      reject,
      effectSize,
      betweenGroupVariance: msb,
      withinGroupVariance: msw,
    };
  }

  /**
   * Mann-Whitney U test (non-parametric alternative to t-test)
   */
  mannWhitneyU(
    data1: number[],
    data2: number[],
    alpha: number = 0.05
  ): TestResult {
    const n1 = data1.length;
    const n2 = data2.length;

    // Combine and rank
    const combined = [
      ...data1.map(val => ({ val, group: 1 })),
      ...data2.map(val => ({ val, group: 2 })),
    ].sort((a, b) => a.val - b.val);

    // Assign ranks
    const ranks = combined.map((_, i) => i + 1);

    // Sum of ranks for group 1
    const r1 = combined.reduce((sum, item, i) =>
      item.group === 1 ? sum + ranks[i] : sum, 0
    );

    // U statistics
    const u1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - r1;
    const u2 = n1 * n2 - u1;
    const u = Math.min(u1, u2);

    // Normal approximation for large samples
    const meanU = (n1 * n2) / 2;
    const stdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    const z = (u - meanU) / stdU;

    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));
    const reject = pValue < alpha;

    // Effect size (rank-biserial correlation)
    const effectSize = 1 - (2 * u) / (n1 * n2);

    return {
      statistic: u,
      pValue,
      reject,
      effectSize,
    };
  }

  /**
   * Kolmogorov-Smirnov test for distribution comparison
   */
  ksTest(
    data1: number[],
    data2: number[],
    alpha: number = 0.05
  ): TestResult {
    const sorted1 = [...data1].sort((a, b) => a - b);
    const sorted2 = [...data2].sort((a, b) => a - b);

    const n1 = sorted1.length;
    const n2 = sorted2.length;

    // Compute empirical CDFs and find maximum difference
    let maxD = 0;
    const allValues = [...new Set([...sorted1, ...sorted2])].sort((a, b) => a - b);

    for (const val of allValues) {
      const cdf1 = sorted1.filter(x => x <= val).length / n1;
      const cdf2 = sorted2.filter(x => x <= val).length / n2;
      const d = Math.abs(cdf1 - cdf2);
      maxD = Math.max(maxD, d);
    }

    // Calculate p-value (approximation)
    const n = Math.sqrt((n1 * n2) / (n1 + n2));
    const lambda = (n + 0.12 + 0.11 / n) * maxD;
    const pValue = 2 * Math.exp(-2 * lambda * lambda);

    const reject = pValue < alpha;

    return {
      statistic: maxD,
      pValue,
      reject,
    };
  }

  // Helper functions for distributions

  private tCDF(x: number, df: number): number {
    // Student's t cumulative distribution function
    const t = x;
    const a = df / (df + t * t);
    const b = 1 - a;

    return 0.5 + 0.5 * Math.sign(t) * this.betaIncomplete(b, 0.5, df / 2);
  }

  private tQuantile(p: number, df: number): number {
    // Approximate inverse t-distribution
    const z = this.normalQuantile(p);
    const g1 = (z * z * z + z) / 4;
    const g2 = (5 * Math.pow(z, 5) + 16 * z * z * z + 3 * z) / 96;

    return z + g1 / df + g2 / (df * df);
  }

  private chiSquareCDF(x: number, df: number): number {
    return this.gammaIncomplete(df / 2, x / 2);
  }

  private fCDF(x: number, df1: number, df2: number): number {
    const a = (df1 * x) / (df1 * x + df2);
    return this.betaIncomplete(a, df1 / 2, df2 / 2);
  }

  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.SQRT2));
  }

  private normalQuantile(p: number): number {
    // Beasley-Springer-Moro algorithm
    const a = [
      -3.969683028665376e+01, 2.209460984245205e+02,
      -2.759285104469687e+02, 1.383577518672690e+02,
      -3.066479806614716e+01, 2.506628277459239e+00
    ];
    const b = [
      -5.447609879822406e+01, 1.615858368580409e+02,
      -1.556989798598866e+02, 6.680131188771972e+01,
      -1.328068155288572e+01
    ];
    const c = [
      -7.784894002430293e-03, -3.223964580411365e-01,
      -2.400758277161838e+00, -2.549732539343734e+00,
      4.374664141464968e+00, 2.938163982698783e+00
    ];
    const d = [
      7.784695709041462e-03, 3.224671290700398e-01,
      2.445134137142996e+00, 3.754408661907416e+00
    ];

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

  private erf(x: number): number {
    // Error function approximation
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

  private betaIncomplete(x: number, a: number, b: number): number {
    if (x === 0) return 0;
    if (x === 1) return 1;

    // Simplified incomplete beta function
    let bt: number;
    if (x < (a + 1) / (a + b + 2)) {
      bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x));
      return bt * this.betaContinuedFraction(x, a, b) / a;
    } else {
      bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x));
      return 1 - bt * this.betaContinuedFraction(1 - x, b, a) / b;
    }
  }

  private betaContinuedFraction(x: number, a: number, b: number): number {
    const maxIter = 100;
    const epsilon = 1e-10;

    let c = 1;
    let d = 1 - (a + b) * x / (a + 1);
    if (Math.abs(d) < epsilon) d = epsilon;
    d = 1 / d;
    let h = d;

    for (let m = 1; m <= maxIter; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < epsilon) d = epsilon;
      c = 1 + aa / c;
      if (Math.abs(c) < epsilon) c = epsilon;
      d = 1 / d;
      h *= d * c;

      aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
      d = 1 + aa * d;
      if (Math.abs(d) < epsilon) d = epsilon;
      c = 1 + aa / c;
      if (Math.abs(c) < epsilon) c = epsilon;
      d = 1 / d;
      const delta = d * c;
      h *= delta;

      if (Math.abs(delta - 1) < epsilon) break;
    }

    return h;
  }

  private gammaIncomplete(a: number, x: number): number {
    // Incomplete gamma function
    if (x < 0 || a <= 0) return 0;

    if (x < a + 1) {
      let sum = 1 / a;
      let term = 1 / a;

      for (let n = 1; n < 100; n++) {
        term *= x / (a + n);
        sum += term;
        if (Math.abs(term) < 1e-10) break;
      }

      return sum * Math.exp(-x + a * Math.log(x));
    } else {
      return 1 - this.gammaIncompleteCF(a, x);
    }
  }

  private gammaIncompleteCF(a: number, x: number): number {
    const epsilon = 1e-10;
    let b = x + 1 - a;
    let c = 1 / epsilon;
    let d = 1 / b;
    let h = d;

    for (let i = 1; i < 100; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < epsilon) d = epsilon;
      c = b + an / c;
      if (Math.abs(c) < epsilon) c = epsilon;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < epsilon) break;
    }

    return Math.exp(-x + a * Math.log(x)) * h;
  }
}
