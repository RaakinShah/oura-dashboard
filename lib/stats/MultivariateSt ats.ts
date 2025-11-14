/**
 * Multivariate Statistical Analysis
 * PCA, Factor Analysis, MANOVA, and more
 */

export interface PCAResult {
  components: number[][];
  eigenvalues: number[];
  explainedVariance: number[];
  cumulativeVariance: number[];
  loadings: number[][];
  scores: number[][];
}

export interface FactorAnalysisResult {
  loadings: number[][];
  uniqueVariances: number[];
  communalities: number[];
  eigenvalues: number[];
}

export class MultivariateStats {
  /**
   * Principal Component Analysis (PCA)
   */
  pca(data: number[][], nComponents?: number): PCAResult {
    const n = data.length;
    const p = data[0].length;
    const k = nComponents || p;

    // Center the data
    const means = this.columnMeans(data);
    const centered = data.map(row =>
      row.map((val, j) => val - means[j])
    );

    // Compute covariance matrix
    const covariance = this.covarianceMatrix(centered);

    // Eigen decomposition
    const { eigenvalues, eigenvectors } = this.eigenDecomposition(covariance);

    // Sort by eigenvalues (descending)
    const sorted = eigenvalues
      .map((val, i) => ({ value: val, vector: eigenvectors[i] }))
      .sort((a, b) => b.value - a.value);

    const sortedEigenvalues = sorted.map(x => x.value);
    const sortedEigenvectors = sorted.map(x => x.vector);

    // Take top k components
    const components = sortedEigenvectors.slice(0, k);

    // Calculate explained variance
    const totalVariance = sortedEigenvalues.reduce((a, b) => a + b, 0);
    const explainedVariance = sortedEigenvalues
      .slice(0, k)
      .map(val => (val / totalVariance) * 100);

    const cumulativeVariance = explainedVariance.reduce((acc, val, i) => {
      acc.push((acc[i - 1] || 0) + val);
      return acc;
    }, [] as number[]);

    // Project data onto components (scores)
    const scores = centered.map(row =>
      components.map(component =>
        this.dotProduct(row, component)
      )
    );

    // Loadings (correlation between variables and components)
    const loadings = this.transpose(components);

    return {
      components,
      eigenvalues: sortedEigenvalues.slice(0, k),
      explainedVariance,
      cumulativeVariance,
      loadings,
      scores,
    };
  }

  /**
   * Factor Analysis (using principal axis factoring)
   */
  factorAnalysis(
    data: number[][],
    nFactors: number,
    maxIterations: number = 100
  ): FactorAnalysisResult {
    const p = data[0].length;

    // Standardize data
    const standardized = this.standardize(data);

    // Compute correlation matrix
    const correlation = this.correlationMatrix(standardized);

    // Initialize communalities (using squared multiple correlations)
    let communalities = new Array(p).fill(0.5);

    // Iterative principal axis factoring
    for (let iter = 0; iter < maxIterations; iter++) {
      // Adjust diagonal of correlation matrix
      const adjusted = correlation.map((row, i) =>
        row.map((val, j) => i === j ? communalities[i] : val)
      );

      // Eigen decomposition
      const { eigenvalues, eigenvectors } = this.eigenDecomposition(adjusted);

      // Sort and take top nFactors
      const sorted = eigenvalues
        .map((val, i) => ({ value: Math.max(0, val), vector: eigenvectors[i] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, nFactors);

      // Calculate loadings
      const loadings = this.transpose(
        sorted.map((s, i) =>
          s.vector.map(v => v * Math.sqrt(s.value))
        )
      );

      // Update communalities
      const newCommunalities = loadings.map(row =>
        row.reduce((sum, val) => sum + val * val, 0)
      );

      // Check convergence
      const maxChange = Math.max(
        ...newCommunalities.map((val, i) => Math.abs(val - communalities[i]))
      );

      communalities = newCommunalities;

      if (maxChange < 1e-6) break;
    }

    // Final factor loadings
    const adjusted = correlation.map((row, i) =>
      row.map((val, j) => i === j ? communalities[i] : val)
    );

    const { eigenvalues, eigenvectors } = this.eigenDecomposition(adjusted);

    const sorted = eigenvalues
      .map((val, i) => ({ value: Math.max(0, val), vector: eigenvectors[i] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, nFactors);

    const loadings = this.transpose(
      sorted.map(s =>
        s.vector.map(v => v * Math.sqrt(s.value))
      )
    );

    // Unique variances
    const uniqueVariances = communalities.map(c => 1 - c);

    return {
      loadings,
      uniqueVariances,
      communalities,
      eigenvalues: sorted.map(s => s.value),
    };
  }

  /**
   * Canonical Correlation Analysis
   */
  canonicalCorrelation(
    X: number[][],
    Y: number[][]
  ): {
    correlations: number[];
    xCoefficients: number[][];
    yCoefficients: number[][];
  } {
    // Standardize both sets
    const Xs = this.standardize(X);
    const Ys = this.standardize(Y);

    // Covariance matrices
    const Sxx = this.covarianceMatrix(Xs);
    const Syy = this.covarianceMatrix(Ys);
    const Sxy = this.crossCovarianceMatrix(Xs, Ys);
    const Syx = this.transpose(Sxy);

    // Compute Sxx^-1 Sxy Syy^-1 Syx
    const SxxInv = this.invertMatrix(Sxx);
    const SyyInv = this.invertMatrix(Syy);

    const M = this.matrixMultiply(
      this.matrixMultiply(
        this.matrixMultiply(SxxInv, Sxy),
        SyyInv
      ),
      Syx
    );

    // Eigen decomposition
    const { eigenvalues, eigenvectors } = this.eigenDecomposition(M);

    // Canonical correlations are square roots of eigenvalues
    const correlations = eigenvalues.map(val => Math.sqrt(Math.max(0, val)));

    // Canonical coefficients
    const xCoefficients = this.transpose(eigenvectors);
    const yCoefficients = xCoefficients.map((xCoef, i) =>
      this.matrixVectorMultiply(
        this.matrixMultiply(SyyInv, Syx),
        xCoef
      ).map(v => v / (correlations[i] || 1))
    );

    return {
      correlations,
      xCoefficients,
      yCoefficients,
    };
  }

  /**
   * Multivariate Analysis of Variance (MANOVA)
   */
  manova(
    groups: number[][][],
    alpha: number = 0.05
  ): {
    wilksLambda: number;
    pillaiTrace: number;
    fStatistic: number;
    pValue: number;
    reject: boolean;
  } {
    const g = groups.length; // number of groups
    const p = groups[0][0].length; // number of variables

    // Total number of observations
    const n = groups.reduce((sum, group) => sum + group.length, 0);

    // Grand mean
    const grandMean = this.columnMeans(
      groups.reduce((acc, group) => [...acc, ...group], [])
    );

    // Between-groups SSCP matrix
    const B = this.zeros(p, p);
    groups.forEach(group => {
      const groupMean = this.columnMeans(group);
      const diff = groupMean.map((m, j) => m - grandMean[j]);
      const nGroup = group.length;

      for (let i = 0; i < p; i++) {
        for (let j = 0; j < p; j++) {
          B[i][j] += nGroup * diff[i] * diff[j];
        }
      }
    });

    // Within-groups SSCP matrix
    const W = this.zeros(p, p);
    groups.forEach(group => {
      const groupMean = this.columnMeans(group);
      group.forEach(obs => {
        const diff = obs.map((val, j) => val - groupMean[j]);
        for (let i = 0; i < p; i++) {
          for (let j = 0; j < p; j++) {
            W[i][j] += diff[i] * diff[j];
          }
        }
      });
    });

    // Wilks' Lambda = |W| / |B + W|
    const detW = this.determinant(W);
    const total = this.matrixAdd(B, W);
    const detTotal = this.determinant(total);
    const wilksLambda = detW / (detTotal || 1);

    // Pillai's trace
    const WInv = this.invertMatrix(W);
    const BWInv = this.matrixMultiply(B, WInv);
    const pillaiTrace = this.trace(BWInv);

    // F approximation for Wilks' Lambda
    const dfHypothesis = p * (g - 1);
    const dfError = n - g;
    const t = Math.sqrt(
      (Math.pow(p * p * (g - 1) * (g - 1) - 4, 2)) /
      (Math.pow(p * p + (g - 1) * (g - 1) - 5, 2))
    );

    const w = n - 1 - (p + g) / 2;
    const df1 = p * (g - 1);
    const df2 = w * t - (p * (g - 1) - 2) / 2;

    const fStatistic = ((1 - Math.pow(wilksLambda, 1 / t)) / Math.pow(wilksLambda, 1 / t)) *
                      (df2 / df1);

    // P-value (approximate using F-distribution)
    const pValue = 1 - this.fCDF(fStatistic, df1, df2);
    const reject = pValue < alpha;

    return {
      wilksLambda,
      pillaiTrace,
      fStatistic,
      pValue,
      reject,
    };
  }

  /**
   * Linear Discriminant Analysis (LDA)
   */
  lda(
    X: number[][],
    y: number[],
    nComponents?: number
  ): {
    scalings: number[][];
    means: number[][];
    priors: number[];
    explained: number[];
  } {
    const classes = [...new Set(y)];
    const k = nComponents || Math.min(classes.length - 1, X[0].length);

    // Class means and priors
    const classMeans: number[][] = [];
    const priors: number[] = [];
    classes.forEach(c => {
      const classData = X.filter((_, i) => y[i] === c);
      classMeans.push(this.columnMeans(classData));
      priors.push(classData.length / X.length);
    });

    // Overall mean
    const overallMean = this.columnMeans(X);

    // Between-class scatter matrix
    const Sb = this.zeros(X[0].length, X[0].length);
    classMeans.forEach((mean, i) => {
      const diff = mean.map((m, j) => m - overallMean[j]);
      const n = X.filter((_, idx) => y[idx] === classes[i]).length;

      for (let row = 0; row < diff.length; row++) {
        for (let col = 0; col < diff.length; col++) {
          Sb[row][col] += n * diff[row] * diff[col];
        }
      }
    });

    // Within-class scatter matrix
    const Sw = this.zeros(X[0].length, X[0].length);
    X.forEach((obs, i) => {
      const classIdx = classes.indexOf(y[i]);
      const diff = obs.map((val, j) => val - classMeans[classIdx][j]);

      for (let row = 0; row < diff.length; row++) {
        for (let col = 0; col < diff.length; col++) {
          Sw[row][col] += diff[row] * diff[col];
        }
      }
    });

    // Solve Sw^-1 * Sb eigenvalue problem
    const SwInv = this.invertMatrix(Sw);
    const M = this.matrixMultiply(SwInv, Sb);
    const { eigenvalues, eigenvectors } = this.eigenDecomposition(M);

    // Sort by eigenvalues
    const sorted = eigenvalues
      .map((val, i) => ({ value: val, vector: eigenvectors[i] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, k);

    const scalings = this.transpose(sorted.map(s => s.vector));

    // Explained variance
    const totalEigen = sorted.reduce((sum, s) => sum + s.value, 0);
    const explained = sorted.map(s => (s.value / totalEigen) * 100);

    return {
      scalings,
      means: classMeans,
      priors,
      explained,
    };
  }

  // Matrix operations helper functions

  private columnMeans(data: number[][]): number[] {
    const n = data.length;
    const p = data[0].length;
    return Array.from({ length: p }, (_, j) =>
      data.reduce((sum, row) => sum + row[j], 0) / n
    );
  }

  private standardize(data: number[][]): number[][] {
    const means = this.columnMeans(data);
    const stds = this.columnStds(data);

    return data.map(row =>
      row.map((val, j) => (val - means[j]) / (stds[j] || 1))
    );
  }

  private columnStds(data: number[][]): number[] {
    const means = this.columnMeans(data);
    const n = data.length;
    const p = data[0].length;

    return Array.from({ length: p }, (_, j) =>
      Math.sqrt(
        data.reduce((sum, row) => sum + Math.pow(row[j] - means[j], 2), 0) / (n - 1)
      )
    );
  }

  private covarianceMatrix(data: number[][]): number[][] {
    const n = data.length;
    const p = data[0].length;
    const cov = this.zeros(p, p);

    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        cov[i][j] = data.reduce((sum, row) => sum + row[i] * row[j], 0) / (n - 1);
      }
    }

    return cov;
  }

  private correlationMatrix(data: number[][]): number[][] {
    const stds = this.columnStds(data);
    const cov = this.covarianceMatrix(data);

    return cov.map((row, i) =>
      row.map((val, j) => val / ((stds[i] || 1) * (stds[j] || 1)))
    );
  }

  private crossCovarianceMatrix(X: number[][], Y: number[][]): number[][] {
    const n = X.length;
    const px = X[0].length;
    const py = Y[0].length;
    const cov = this.zeros(px, py);

    for (let i = 0; i < px; i++) {
      for (let j = 0; j < py; j++) {
        cov[i][j] = X.reduce((sum, row, k) => sum + row[i] * Y[k][j], 0) / (n - 1);
      }
    }

    return cov;
  }

  private eigenDecomposition(matrix: number[][]): {
    eigenvalues: number[];
    eigenvectors: number[][];
  } {
    // Power iteration method for finding eigenvalues/vectors
    const n = matrix.length;
    const eigenvalues: number[] = [];
    const eigenvectors: number[][] = [];

    let A = matrix.map(row => [...row]);

    for (let k = 0; k < n; k++) {
      // Random initial vector
      let v = Array.from({ length: n }, () => Math.random());

      // Normalize
      let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
      v = v.map(val => val / norm);

      // Power iteration
      for (let iter = 0; iter < 100; iter++) {
        const Av = this.matrixVectorMultiply(A, v);
        norm = Math.sqrt(Av.reduce((sum, val) => sum + val * val, 0));
        const newV = Av.map(val => val / norm);

        if (this.vectorDistance(v, newV) < 1e-10) break;
        v = newV;
      }

      const eigenvalue = this.dotProduct(this.matrixVectorMultiply(A, v), v);
      eigenvalues.push(eigenvalue);
      eigenvectors.push(v);

      // Deflate matrix
      A = this.matrixSubtract(A, this.outerProduct(v, v, eigenvalue));
    }

    return { eigenvalues, eigenvectors };
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
    return A.map(row => this.dotProduct(row, v));
  }

  private matrixAdd(A: number[][], B: number[][]): number[][] {
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
  }

  private matrixSubtract(A: number[][], B: number[][]): number[][] {
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
  }

  private outerProduct(u: number[], v: number[], scalar: number = 1): number[][] {
    return u.map(ui => v.map(vi => scalar * ui * vi));
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  private vectorDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  private zeros(rows: number, cols: number): number[][] {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
  }

  private determinant(matrix: number[][]): number {
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = matrix.slice(1).map(row =>
        row.filter((_, col) => col !== j)
      );
      det += Math.pow(-1, j) * matrix[0][j] * this.determinant(minor);
    }
    return det;
  }

  private trace(matrix: number[][]): number {
    return matrix.reduce((sum, row, i) => sum + row[i], 0);
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

  private fCDF(x: number, df1: number, df2: number): number {
    if (x <= 0) return 0;
    const a = (df1 * x) / (df1 * x + df2);
    return this.betaIncomplete(a, df1 / 2, df2 / 2);
  }

  private betaIncomplete(x: number, a: number, b: number): number {
    if (x === 0) return 0;
    if (x === 1) return 1;

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
}
