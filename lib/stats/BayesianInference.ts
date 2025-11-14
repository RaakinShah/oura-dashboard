/**
 * Bayesian Inference Engine
 * Implements Bayesian statistical methods for probabilistic reasoning
 */

export interface Prior {
  alpha: number;
  beta: number;
}

export interface Posterior {
  alpha: number;
  beta: number;
  mean: number;
  mode: number;
  variance: number;
  credibleInterval: { lower: number; upper: number };
}

export class BayesianInference {
  /**
   * Beta distribution PDF
   */
  private betaPDF(x: number, alpha: number, beta: number): number {
    if (x <= 0 || x >= 1) return 0;

    const betaFunction = this.gammaFunction(alpha) * this.gammaFunction(beta) /
                         this.gammaFunction(alpha + beta);

    return Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1) / betaFunction;
  }

  /**
   * Gamma function approximation (Stirling's approximation)
   */
  private gammaFunction(n: number): number {
    if (n === 1) return 1;
    if (n === 2) return 1;
    if (n < 1) {
      return Math.PI / (Math.sin(Math.PI * n) * this.gammaFunction(1 - n));
    }

    n = n - 1;
    const x = 0.99999999999980993;
    const coefficients = [
      676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012,
      9.9843695780195716e-6, 1.5056327351493116e-7
    ];

    let y = x;
    for (let i = 0; i < coefficients.length; i++) {
      y += coefficients[i] / (n + i + 1);
    }

    const t = n + coefficients.length - 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * y;
  }

  /**
   * Update Beta prior with new observations
   */
  updateBetaPrior(prior: Prior, successes: number, failures: number): Posterior {
    const alpha = prior.alpha + successes;
    const beta = prior.beta + failures;

    const mean = alpha / (alpha + beta);
    const mode = alpha > 1 && beta > 1 ? (alpha - 1) / (alpha + beta - 2) : 0.5;
    const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));

    // 95% credible interval using quantile function approximation
    const credibleInterval = this.betaCredibleInterval(alpha, beta, 0.95);

    return {
      alpha,
      beta,
      mean,
      mode,
      variance,
      credibleInterval,
    };
  }

  /**
   * Calculate credible interval for Beta distribution
   */
  private betaCredibleInterval(alpha: number, beta: number, confidence: number):
    { lower: number; upper: number } {
    const tail = (1 - confidence) / 2;

    // Approximate quantile function using binary search
    const lower = this.betaQuantile(alpha, beta, tail);
    const upper = this.betaQuantile(alpha, beta, 1 - tail);

    return { lower, upper };
  }

  /**
   * Beta distribution quantile function (inverse CDF)
   */
  private betaQuantile(alpha: number, beta: number, p: number): number {
    let low = 0;
    let high = 1;
    let mid = 0.5;

    for (let i = 0; i < 100; i++) {
      mid = (low + high) / 2;
      const cdf = this.betaCDF(mid, alpha, beta);

      if (Math.abs(cdf - p) < 1e-6) break;

      if (cdf < p) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return mid;
  }

  /**
   * Beta distribution CDF
   */
  private betaCDF(x: number, alpha: number, beta: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    // Incomplete beta function approximation
    return this.incompleteBeta(x, alpha, beta);
  }

  /**
   * Incomplete beta function
   */
  private incompleteBeta(x: number, a: number, b: number): number {
    if (x === 0) return 0;
    if (x === 1) return 1;

    // Use continued fraction expansion
    const lnBeta = this.logBeta(a, b);
    const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;

    const f = this.continuedFraction(x, a, b);

    return front * f;
  }

  /**
   * Log beta function
   */
  private logBeta(a: number, b: number): number {
    return Math.log(this.gammaFunction(a)) +
           Math.log(this.gammaFunction(b)) -
           Math.log(this.gammaFunction(a + b));
  }

  /**
   * Continued fraction for incomplete beta
   */
  private continuedFraction(x: number, a: number, b: number): number {
    const maxIterations = 100;
    const epsilon = 1e-10;

    let c = 1;
    let d = 1 - (a + b) * x / (a + 1);

    if (Math.abs(d) < epsilon) d = epsilon;
    d = 1 / d;
    let h = d;

    for (let m = 1; m <= maxIterations; m++) {
      const m2 = 2 * m;

      // Even step
      let aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < epsilon) d = epsilon;
      c = 1 + aa / c;
      if (Math.abs(c) < epsilon) c = epsilon;
      d = 1 / d;
      h *= d * c;

      // Odd step
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

  /**
   * Bayesian A/B Test
   */
  abTest(
    controlSuccesses: number,
    controlTotal: number,
    treatmentSuccesses: number,
    treatmentTotal: number,
    prior: Prior = { alpha: 1, beta: 1 }
  ): {
    controlPosterior: Posterior;
    treatmentPosterior: Posterior;
    probabilityTreatmentBetter: number;
    expectedLift: number;
  } {
    const controlPosterior = this.updateBetaPrior(
      prior,
      controlSuccesses,
      controlTotal - controlSuccesses
    );

    const treatmentPosterior = this.updateBetaPrior(
      prior,
      treatmentSuccesses,
      treatmentTotal - treatmentSuccesses
    );

    // Monte Carlo simulation to calculate P(treatment > control)
    const samples = 10000;
    let treatmentWins = 0;
    let liftSum = 0;

    for (let i = 0; i < samples; i++) {
      const controlSample = this.sampleBeta(controlPosterior.alpha, controlPosterior.beta);
      const treatmentSample = this.sampleBeta(treatmentPosterior.alpha, treatmentPosterior.beta);

      if (treatmentSample > controlSample) {
        treatmentWins++;
      }

      liftSum += (treatmentSample - controlSample) / controlSample;
    }

    return {
      controlPosterior,
      treatmentPosterior,
      probabilityTreatmentBetter: treatmentWins / samples,
      expectedLift: liftSum / samples,
    };
  }

  /**
   * Sample from Beta distribution
   */
  private sampleBeta(alpha: number, beta: number): number {
    const gamma1 = this.sampleGamma(alpha, 1);
    const gamma2 = this.sampleGamma(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  }

  /**
   * Sample from Gamma distribution
   */
  private sampleGamma(shape: number, scale: number): number {
    // Marsaglia and Tsang method
    if (shape < 1) {
      return this.sampleGamma(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x, v;
      do {
        x = this.normalSample();
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();

      if (u < 1 - 0.0331 * x * x * x * x) {
        return d * v * scale;
      }

      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  /**
   * Sample from standard normal distribution (Box-Muller)
   */
  private normalSample(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Bayesian linear regression
   */
  bayesianLinearRegression(
    X: number[][],
    y: number[],
    priorMean: number[] = [],
    priorPrecision: number = 1
  ): {
    posteriorMean: number[];
    posteriorCovariance: number[][];
    predictions: number[];
    uncertainty: number[];
  } {
    const n = X.length;
    const m = X[0].length;

    // Add intercept column
    const XAug = X.map(row => [1, ...row]);

    // Prior
    const prior = priorMean.length > 0 ? priorMean : new Array(m + 1).fill(0);

    // Compute posterior (simplified, assuming known noise variance)
    const XTX = this.matrixMultiply(this.transpose(XAug), XAug);
    const XTy = this.matrixVectorMultiply(this.transpose(XAug), y);

    // Add prior precision to diagonal
    for (let i = 0; i < m + 1; i++) {
      XTX[i][i] += priorPrecision;
    }

    const posteriorCovariance = this.invertMatrix(XTX);
    const posteriorMean = this.matrixVectorMultiply(posteriorCovariance, XTy);

    // Predictions
    const predictions = XAug.map(row =>
      row.reduce((sum, val, i) => sum + val * posteriorMean[i], 0)
    );

    // Uncertainty (predictive variance)
    const uncertainty = XAug.map(row => {
      const xT_Sigma = this.matrixVectorMultiply([row],
        this.matrixVectorMultiply(posteriorCovariance, row)
      );
      return Math.sqrt(xT_Sigma[0]);
    });

    return {
      posteriorMean,
      posteriorCovariance,
      predictions,
      uncertainty,
    };
  }

  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
  }

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < A[0].length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private matrixVectorMultiply(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
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
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    for (let i = n - 1; i >= 0; i--) {
      for (let k = i - 1; k >= 0; k--) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const divisor = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= divisor;
      }
    }

    return augmented.map(row => row.slice(n));
  }
}
