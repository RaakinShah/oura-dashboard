/**
 * Monte Carlo Simulation Engine
 * Probabilistic simulations for risk analysis and forecasting
 */

export interface SimulationConfig {
  iterations: number;
  confidenceLevel?: number;
  seed?: number;
}

export interface SimulationResult {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  percentiles: { [key: number]: number };
  confidenceInterval: { lower: number; upper: number };
  histogram: { bins: number[]; counts: number[] };
  samples: number[];
}

export class MonteCarloSimulation {
  private rngState: number;

  constructor(seed?: number) {
    this.rngState = seed || Date.now();
  }

  /**
   * Linear Congruential Generator for reproducible randomness
   */
  private random(): number {
    this.rngState = (this.rngState * 1103515245 + 12345) % 2147483648;
    return this.rngState / 2147483648;
  }

  /**
   * Normal distribution sample (Box-Muller)
   */
  normalSample(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.random();
    const u2 = this.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z;
  }

  /**
   * Log-normal distribution sample
   */
  logNormalSample(mu: number, sigma: number): number {
    return Math.exp(this.normalSample(mu, sigma));
  }

  /**
   * Uniform distribution sample
   */
  uniformSample(min: number, max: number): number {
    return min + (max - min) * this.random();
  }

  /**
   * Exponential distribution sample
   */
  exponentialSample(lambda: number): number {
    return -Math.log(1 - this.random()) / lambda;
  }

  /**
   * Triangular distribution sample
   */
  triangularSample(min: number, mode: number, max: number): number {
    const u = this.random();
    const f = (mode - min) / (max - min);

    if (u < f) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  /**
   * Run Monte Carlo simulation
   */
  simulate(
    sampleFunction: () => number,
    config: SimulationConfig
  ): SimulationResult {
    const { iterations, confidenceLevel = 0.95 } = config;
    const samples: number[] = [];

    for (let i = 0; i < iterations; i++) {
      samples.push(sampleFunction());
    }

    return this.analyzeResults(samples, confidenceLevel);
  }

  /**
   * Analyze simulation results
   */
  private analyzeResults(samples: number[], confidenceLevel: number): SimulationResult {
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = sorted.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const min = sorted[0];
    const max = sorted[n - 1];

    // Percentiles
    const percentiles: { [key: number]: number } = {};
    [5, 10, 25, 50, 75, 90, 95, 99].forEach(p => {
      const index = Math.ceil((p / 100) * n) - 1;
      percentiles[p] = sorted[Math.max(0, Math.min(n - 1, index))];
    });

    // Confidence interval
    const tail = (1 - confidenceLevel) / 2;
    const lowerIndex = Math.floor(tail * n);
    const upperIndex = Math.ceil((1 - tail) * n) - 1;
    const confidenceInterval = {
      lower: sorted[lowerIndex],
      upper: sorted[upperIndex],
    };

    // Histogram
    const histogram = this.createHistogram(sorted, 20);

    return {
      mean,
      median,
      stdDev,
      variance,
      min,
      max,
      percentiles,
      confidenceInterval,
      histogram,
      samples: sorted,
    };
  }

  /**
   * Create histogram from data
   */
  private createHistogram(
    data: number[],
    numBins: number
  ): { bins: number[]; counts: number[] } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / numBins;

    const bins: number[] = [];
    const counts: number[] = new Array(numBins).fill(0);

    for (let i = 0; i < numBins; i++) {
      bins.push(min + i * binWidth);
    }

    data.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        numBins - 1
      );
      counts[binIndex]++;
    });

    return { bins, counts };
  }

  /**
   * Portfolio risk simulation
   */
  simulatePortfolioRisk(
    assets: Array<{
      expectedReturn: number;
      volatility: number;
      weight: number;
    }>,
    correlationMatrix: number[][],
    config: SimulationConfig
  ): SimulationResult & {
    valueAtRisk: number;
    conditionalVaR: number;
    sharpeRatio: number;
  } {
    const { iterations } = config;
    const samples: number[] = [];

    for (let i = 0; i < iterations; i++) {
      // Generate correlated returns using Cholesky decomposition
      const returns = this.generateCorrelatedReturns(
        assets.map(a => a.expectedReturn),
        assets.map(a => a.volatility),
        correlationMatrix
      );

      // Calculate portfolio return
      const portfolioReturn = assets.reduce(
        (sum, asset, idx) => sum + asset.weight * returns[idx],
        0
      );

      samples.push(portfolioReturn);
    }

    const result = this.analyzeResults(samples, 0.95);

    // Value at Risk (95% VaR)
    const valueAtRisk = result.percentiles[5];

    // Conditional VaR (Expected Shortfall)
    const conditionalVaR = samples
      .filter(r => r <= valueAtRisk)
      .reduce((a, b) => a + b, 0) / samples.filter(r => r <= valueAtRisk).length;

    // Sharpe Ratio (assuming risk-free rate = 0)
    const sharpeRatio = result.mean / result.stdDev;

    return {
      ...result,
      valueAtRisk,
      conditionalVaR,
      sharpeRatio,
    };
  }

  /**
   * Generate correlated random returns
   */
  private generateCorrelatedReturns(
    means: number[],
    stdDevs: number[],
    correlationMatrix: number[][]
  ): number[] {
    const n = means.length;

    // Cholesky decomposition
    const L = this.choleskyDecomposition(correlationMatrix);

    // Generate independent normal samples
    const z = means.map(() => this.normalSample(0, 1));

    // Apply correlation
    const correlatedZ = this.matrixVectorMultiply(L, z);

    // Scale by mean and std dev
    return correlatedZ.map((val, i) => means[i] + stdDevs[i] * val);
  }

  /**
   * Cholesky decomposition
   */
  private choleskyDecomposition(matrix: number[][]): number[][] {
    const n = matrix.length;
    const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }

        if (i === j) {
          L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
        } else {
          L[i][j] = (matrix[i][j] - sum) / (L[j][j] || 1);
        }
      }
    }

    return L;
  }

  private matrixVectorMultiply(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
  }

  /**
   * Bootstrap resampling
   */
  bootstrap(
    data: number[],
    statistic: (sample: number[]) => number,
    config: SimulationConfig
  ): SimulationResult {
    const { iterations } = config;
    const samples: number[] = [];
    const n = data.length;

    for (let i = 0; i < iterations; i++) {
      const resample: number[] = [];
      for (let j = 0; j < n; j++) {
        const index = Math.floor(this.random() * n);
        resample.push(data[index]);
      }
      samples.push(statistic(resample));
    }

    return this.analyzeResults(samples, 0.95);
  }

  /**
   * Markov Chain Monte Carlo (Metropolis-Hastings)
   */
  mcmc(
    targetDistribution: (x: number) => number,
    proposalStdDev: number,
    initialValue: number,
    config: SimulationConfig
  ): SimulationResult & { acceptanceRate: number } {
    const { iterations } = config;
    const samples: number[] = [];
    let current = initialValue;
    let accepted = 0;

    for (let i = 0; i < iterations; i++) {
      // Propose new value
      const proposal = current + this.normalSample(0, proposalStdDev);

      // Calculate acceptance probability
      const currentProb = targetDistribution(current);
      const proposalProb = targetDistribution(proposal);
      const acceptProb = Math.min(1, proposalProb / (currentProb || 1e-10));

      // Accept or reject
      if (this.random() < acceptProb) {
        current = proposal;
        accepted++;
      }

      samples.push(current);
    }

    const result = this.analyzeResults(samples, 0.95);

    return {
      ...result,
      acceptanceRate: accepted / iterations,
    };
  }
}
