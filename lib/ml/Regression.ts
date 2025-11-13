/**
 * Multiple Regression Models
 */

export interface RegressionData {
  x: number[] | number[][];
  y: number[];
}

export class LinearRegression {
  private coefficients: number[] = [];
  private intercept: number = 0;

  fit(X: number[][], y: number[]) {
    const n = X.length;
    const m = X[0].length;

    // Add intercept column
    const XWithIntercept = X.map(row => [1, ...row]);

    // Normal equation: β = (X^T X)^(-1) X^T y
    const XT = this.transpose(XWithIntercept);
    const XTX = this.matrixMultiply(XT, XWithIntercept);
    const XTXInv = this.invertMatrix(XTX);
    const XTy = this.matrixVectorMultiply(XT, y);
    const beta = this.matrixVectorMultiply(XTXInv, XTy);

    this.intercept = beta[0];
    this.coefficients = beta.slice(1);
  }

  predict(X: number[][]): number[] {
    return X.map(row => {
      const sum = row.reduce((acc, val, i) => acc + val * this.coefficients[i], 0);
      return this.intercept + sum;
    });
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

    // Gaussian elimination
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

    // Back substitution
    for (let i = n - 1; i >= 0; i--) {
      for (let k = i - 1; k >= 0; k--) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Normalize
    for (let i = 0; i < n; i++) {
      const divisor = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= divisor;
      }
    }

    return augmented.map(row => row.slice(n));
  }

  getCoefficients(): { intercept: number; coefficients: number[] } {
    return {
      intercept: this.intercept,
      coefficients: this.coefficients,
    };
  }
}

export class PolynomialRegression extends LinearRegression {
  private degree: number;

  constructor(degree: number = 2) {
    super();
    this.degree = degree;
  }

  fit(X: number[][], y: number[]) {
    const XPoly = this.generatePolynomialFeatures(X);
    super.fit(XPoly, y);
  }

  predict(X: number[][]): number[] {
    const XPoly = this.generatePolynomialFeatures(X);
    return super.predict(XPoly);
  }

  private generatePolynomialFeatures(X: number[][]): number[][] {
    return X.map(row => {
      const features: number[] = [];
      for (let d = 1; d <= this.degree; d++) {
        for (let i = 0; i < row.length; i++) {
          features.push(Math.pow(row[i], d));
        }
      }
      return features;
    });
  }
}

export class LogisticRegression {
  private coefficients: number[] = [];
  private intercept: number = 0;
  private learningRate: number;
  private iterations: number;

  constructor(learningRate: number = 0.01, iterations: number = 1000) {
    this.learningRate = learningRate;
    this.iterations = iterations;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  fit(X: number[][], y: number[]) {
    const n = X.length;
    const m = X[0].length;

    this.coefficients = new Array(m).fill(0);
    this.intercept = 0;

    for (let iter = 0; iter < this.iterations; iter++) {
      const predictions = X.map(row => {
        const z = this.intercept + row.reduce((sum, val, i) => 
          sum + val * this.coefficients[i], 0
        );
        return this.sigmoid(z);
      });

      const errors = predictions.map((pred, i) => pred - y[i]);

      // Update coefficients
      for (let j = 0; j < m; j++) {
        const gradient = errors.reduce((sum, error, i) => 
          sum + error * X[i][j], 0
        ) / n;
        this.coefficients[j] -= this.learningRate * gradient;
      }

      // Update intercept
      const interceptGradient = errors.reduce((a, b) => a + b, 0) / n;
      this.intercept -= this.learningRate * interceptGradient;
    }
  }

  predict(X: number[][]): number[] {
    return X.map(row => {
      const z = this.intercept + row.reduce((sum, val, i) => 
        sum + val * this.coefficients[i], 0
      );
      return this.sigmoid(z);
    });
  }

  predictClass(X: number[][], threshold: number = 0.5): number[] {
    return this.predict(X).map(p => p >= threshold ? 1 : 0);
  }
}
