/**
 * ADVANCED MACHINE LEARNING CORE
 * True AI algorithms: Clustering, PCA, Bayesian Inference, Ensemble Methods
 */

export interface DataPoint {
  features: number[];
  label?: string;
  timestamp?: Date;
}

export interface Cluster {
  id: number;
  centroid: number[];
  points: DataPoint[];
  variance: number;
  label?: string;
}

export interface PCAResult {
  components: number[][];
  explainedVariance: number[];
  transformedData: number[][];
  meanVector: number[];
}

/**
 * K-Means Clustering - Unsupervised Learning
 */
export class KMeansClustering {
  private k: number;
  private maxIterations: number;
  private tolerance: number;

  constructor(k: number = 3, maxIterations: number = 100, tolerance: number = 0.0001) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
  }

  /**
   * Fit the model and return clusters
   */
  fit(data: number[][]): Cluster[] {
    if (data.length < this.k) {
      throw new Error(`Not enough data points (${data.length}) for ${this.k} clusters`);
    }

    // Initialize centroids using k-means++
    let centroids = this.initializeCentroidsKMeansPlusPlus(data);
    let assignments: number[] = new Array(data.length).fill(0);
    let iterations = 0;
    let converged = false;

    while (!converged && iterations < this.maxIterations) {
      // Assignment step
      const newAssignments = data.map(point =>
        this.findNearestCentroid(point, centroids)
      );

      // Update step
      const newCentroids = this.updateCentroids(data, newAssignments);

      // Check convergence
      const maxChange = centroids.reduce((max, centroid, i) => {
        const distance = this.euclideanDistance(centroid, newCentroids[i]);
        return Math.max(max, distance);
      }, 0);

      converged = maxChange < this.tolerance;
      centroids = newCentroids;
      assignments = newAssignments;
      iterations++;
    }

    // Build clusters
    return this.buildClusters(data, centroids, assignments);
  }

  /**
   * K-means++ initialization for better convergence
   */
  private initializeCentroidsKMeansPlusPlus(data: number[][]): number[][] {
    const centroids: number[][] = [];

    // Choose first centroid randomly
    const firstIdx = Math.floor(Math.random() * data.length);
    centroids.push([...data[firstIdx]]);

    // Choose remaining centroids with probability proportional to distance²
    for (let i = 1; i < this.k; i++) {
      const distances = data.map(point => {
        const minDist = Math.min(...centroids.map(c =>
          this.euclideanDistance(point, c)
        ));
        return minDist * minDist;
      });

      const totalDist = distances.reduce((sum, d) => sum + d, 0);
      let random = Math.random() * totalDist;

      for (let j = 0; j < distances.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          centroids.push([...data[j]]);
          break;
        }
      }
    }

    return centroids;
  }

  private findNearestCentroid(point: number[], centroids: number[][]): number {
    let minDist = Infinity;
    let nearest = 0;

    centroids.forEach((centroid, i) => {
      const dist = this.euclideanDistance(point, centroid);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });

    return nearest;
  }

  private updateCentroids(data: number[][], assignments: number[]): number[][] {
    const centroids: number[][] = [];

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((_, idx) => assignments[idx] === i);

      if (clusterPoints.length === 0) {
        // If cluster is empty, reinitialize randomly
        centroids.push([...data[Math.floor(Math.random() * data.length)]]);
      } else {
        const centroid = this.calculateMean(clusterPoints);
        centroids.push(centroid);
      }
    }

    return centroids;
  }

  private calculateMean(points: number[][]): number[] {
    const dimensions = points[0].length;
    const mean = new Array(dimensions).fill(0);

    points.forEach(point => {
      point.forEach((value, i) => {
        mean[i] += value;
      });
    });

    return mean.map(sum => sum / points.length);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - (b[i] || 0), 2), 0)
    );
  }

  private buildClusters(
    data: number[][],
    centroids: number[][],
    assignments: number[]
  ): Cluster[] {
    return centroids.map((centroid, i) => {
      const points = data
        .map((features, idx) => ({ features, timestamp: new Date() }))
        .filter((_, idx) => assignments[idx] === i);

      const variance = this.calculateClusterVariance(
        points.map(p => p.features),
        centroid
      );

      return {
        id: i,
        centroid,
        points,
        variance,
      };
    });
  }

  private calculateClusterVariance(points: number[][], centroid: number[]): number {
    if (points.length === 0) return 0;

    const sumSquaredDist = points.reduce((sum, point) => {
      return sum + Math.pow(this.euclideanDistance(point, centroid), 2);
    }, 0);

    return sumSquaredDist / points.length;
  }

  /**
   * Predict cluster for new data point
   */
  predict(point: number[], clusters: Cluster[]): number {
    return this.findNearestCentroid(
      point,
      clusters.map(c => c.centroid)
    );
  }
}

/**
 * Principal Component Analysis - Dimensionality Reduction
 */
export class PCA {
  private nComponents: number;

  constructor(nComponents: number = 2) {
    this.nComponents = nComponents;
  }

  /**
   * Fit PCA and transform data
   */
  fitTransform(data: number[][]): PCAResult {
    // Center the data
    const meanVector = this.calculateMean(data);
    const centeredData = data.map(row =>
      row.map((val, i) => val - meanVector[i])
    );

    // Calculate covariance matrix
    const covMatrix = this.calculateCovarianceMatrix(centeredData);

    // Get eigenvalues and eigenvectors using power iteration
    const eigenPairs = this.powerIteration(covMatrix, this.nComponents);

    // Sort by eigenvalue (descending)
    eigenPairs.sort((a, b) => b.value - a.value);

    // Extract principal components
    const components = eigenPairs.map(pair => pair.vector);
    const explainedVariance = eigenPairs.map(pair => pair.value);

    // Transform data
    const transformedData = this.transform(centeredData, components);

    return {
      components,
      explainedVariance,
      transformedData,
      meanVector,
    };
  }

  private calculateMean(data: number[][]): number[] {
    const numFeatures = data[0].length;
    const mean = new Array(numFeatures).fill(0);

    data.forEach(row => {
      row.forEach((val, i) => {
        mean[i] += val;
      });
    });

    return mean.map(sum => sum / data.length);
  }

  private calculateCovarianceMatrix(centeredData: number[][]): number[][] {
    const n = centeredData.length;
    const m = centeredData[0].length;
    const cov: number[][] = Array(m).fill(0).map(() => Array(m).fill(0));

    for (let i = 0; i < m; i++) {
      for (let j = i; j < m; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += centeredData[k][i] * centeredData[k][j];
        }
        cov[i][j] = sum / (n - 1);
        cov[j][i] = cov[i][j]; // Symmetric matrix
      }
    }

    return cov;
  }

  /**
   * Power iteration method for finding eigenvectors
   */
  private powerIteration(matrix: number[][], numEigen: number): Array<{value: number, vector: number[]}> {
    const n = matrix.length;
    const eigenPairs: Array<{value: number, vector: number[]}> = [];

    for (let i = 0; i < numEigen; i++) {
      // Random initialization
      let vector = Array(n).fill(0).map(() => Math.random() - 0.5);
      vector = this.normalize(vector);

      let eigenvalue = 0;
      let converged = false;
      let iterations = 0;

      while (!converged && iterations < 1000) {
        // Matrix-vector multiplication
        const newVector = this.matrixVectorMultiply(matrix, vector);

        // Calculate eigenvalue (Rayleigh quotient)
        eigenvalue = this.dotProduct(vector, newVector);

        // Normalize
        const normalized = this.normalize(newVector);

        // Check convergence
        const diff = this.vectorDistance(vector, normalized);
        converged = diff < 0.0001;

        vector = normalized;
        iterations++;
      }

      eigenPairs.push({ value: Math.abs(eigenvalue), vector });

      // Deflate matrix for next eigenvector
      matrix = this.deflateMatrix(matrix, vector, eigenvalue);
    }

    return eigenPairs;
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row =>
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  }

  private vectorDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }

  private deflateMatrix(matrix: number[][], vector: number[], eigenvalue: number): number[][] {
    const n = matrix.length;
    const deflated: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        deflated[i][j] = matrix[i][j] - eigenvalue * vector[i] * vector[j];
      }
    }

    return deflated;
  }

  private transform(data: number[][], components: number[][]): number[][] {
    return data.map(row =>
      components.map(component =>
        this.dotProduct(row, component)
      )
    );
  }
}

/**
 * Bayesian Inference Engine
 */
export class BayesianInference {
  private priors: Map<string, number> = new Map();
  private likelihoods: Map<string, Map<string, number>> = new Map();

  /**
   * Update beliefs based on new evidence
   */
  updateBelief(hypothesis: string, evidence: string, prior?: number): number {
    // P(H|E) = P(E|H) * P(H) / P(E)

    const priorProb = prior ?? this.priors.get(hypothesis) ?? 0.5;
    const likelihood = this.getLikelihood(evidence, hypothesis);
    const marginal = this.calculateMarginal(evidence);

    const posterior = (likelihood * priorProb) / marginal;

    // Update prior for next iteration
    this.priors.set(hypothesis, posterior);

    return posterior;
  }

  /**
   * Set likelihood P(E|H)
   */
  setLikelihood(evidence: string, hypothesis: string, probability: number): void {
    if (!this.likelihoods.has(evidence)) {
      this.likelihoods.set(evidence, new Map());
    }
    this.likelihoods.get(evidence)!.set(hypothesis, probability);
  }

  private getLikelihood(evidence: string, hypothesis: string): number {
    return this.likelihoods.get(evidence)?.get(hypothesis) ?? 0.5;
  }

  private calculateMarginal(evidence: string): number {
    // P(E) = Σ P(E|H) * P(H) for all hypotheses
    let marginal = 0;

    const evidenceLikelihoods = this.likelihoods.get(evidence);
    if (!evidenceLikelihoods) return 1;

    evidenceLikelihoods.forEach((likelihood, hypothesis) => {
      const prior = this.priors.get(hypothesis) ?? 0.5;
      marginal += likelihood * prior;
    });

    return marginal || 1;
  }

  /**
   * Get current belief
   */
  getBelief(hypothesis: string): number {
    return this.priors.get(hypothesis) ?? 0.5;
  }
}

/**
 * Ensemble Model - Combines multiple models
 */
export class EnsembleModel {
  private models: Array<{
    predict: (input: number[]) => number | number[];
    weight: number;
    accuracy?: number;
  }> = [];

  /**
   * Add model to ensemble
   */
  addModel(
    model: { predict: (input: number[]) => number | number[] },
    weight: number = 1,
    accuracy?: number
  ): void {
    this.models.push({ predict: model.predict.bind(model), weight, accuracy });
  }

  /**
   * Weighted average prediction
   */
  predict(input: number[]): number {
    let weightedSum = 0;
    let totalWeight = 0;

    this.models.forEach(model => {
      const prediction = model.predict(input);
      const value = Array.isArray(prediction) ? prediction[0] : prediction;
      weightedSum += value * model.weight;
      totalWeight += model.weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Update model weights based on performance
   */
  updateWeights(performances: number[]): void {
    performances.forEach((performance, i) => {
      if (this.models[i]) {
        this.models[i].weight = Math.max(0.1, performance);
        this.models[i].accuracy = performance;
      }
    });
  }

  /**
   * Get ensemble statistics
   */
  getStats(): {
    totalModels: number;
    averageWeight: number;
    averageAccuracy: number;
  } {
    const totalWeight = this.models.reduce((sum, m) => sum + m.weight, 0);
    const totalAccuracy = this.models.reduce((sum, m) => sum + (m.accuracy || 0), 0);

    return {
      totalModels: this.models.length,
      averageWeight: totalWeight / this.models.length,
      averageAccuracy: totalAccuracy / this.models.length,
    };
  }
}

/**
 * Anomaly Detection using Statistical Methods
 */
export class AnomalyDetector {
  private mean: number[] = [];
  private std: number[] = [];
  private threshold: number;

  constructor(threshold: number = 3) {
    this.threshold = threshold; // Number of standard deviations
  }

  /**
   * Fit the model on training data
   */
  fit(data: number[][]): void {
    const numFeatures = data[0].length;
    this.mean = new Array(numFeatures).fill(0);
    this.std = new Array(numFeatures).fill(0);

    // Calculate mean
    data.forEach(row => {
      row.forEach((val, i) => {
        this.mean[i] += val;
      });
    });
    this.mean = this.mean.map(sum => sum / data.length);

    // Calculate standard deviation
    data.forEach(row => {
      row.forEach((val, i) => {
        this.std[i] += Math.pow(val - this.mean[i], 2);
      });
    });
    this.std = this.std.map((sum, i) =>
      Math.sqrt(sum / data.length) || 1
    );
  }

  /**
   * Detect if point is anomalous
   */
  isAnomaly(point: number[]): boolean {
    const zScores = point.map((val, i) =>
      Math.abs((val - this.mean[i]) / this.std[i])
    );

    return zScores.some(z => z > this.threshold);
  }

  /**
   * Get anomaly score
   */
  getAnomalyScore(point: number[]): number {
    const zScores = point.map((val, i) =>
      Math.abs((val - this.mean[i]) / this.std[i])
    );

    return Math.max(...zScores);
  }
}
