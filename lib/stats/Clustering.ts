/**
 * Clustering Algorithms
 * Implements k-means, DBSCAN, and hierarchical clustering
 */

export interface ClusterPoint {
  values: number[];
  cluster?: number;
  metadata?: Record<string, any>;
}

export interface KMeansResult {
  clusters: number[];
  centroids: number[][];
  inertia: number;
  iterations: number;
}

export interface DBSCANResult {
  clusters: number[];
  labels: number[];
  corePoints: number[];
  noise: number[];
}

export class Clustering {
  /**
   * K-Means Clustering
   */
  kMeans(
    data: number[][],
    k: number,
    maxIterations: number = 100,
    tolerance: number = 1e-4
  ): KMeansResult {
    if (data.length === 0 || k <= 0 || k > data.length) {
      throw new Error('Invalid parameters for k-means');
    }

    const n = data.length;
    const dimensions = data[0].length;

    // Initialize centroids using k-means++
    const centroids = this.kMeansPlusPlus(data, k);
    let clusters = new Array(n).fill(0);
    let prevCentroids = centroids.map(c => [...c]);
    let iterations = 0;

    for (let iter = 0; iter < maxIterations; iter++) {
      iterations++;

      // Assignment step
      for (let i = 0; i < n; i++) {
        let minDist = Infinity;
        let bestCluster = 0;

        for (let j = 0; j < k; j++) {
          const dist = this.euclideanDistance(data[i], centroids[j]);
          if (dist < minDist) {
            minDist = dist;
            bestCluster = j;
          }
        }

        clusters[i] = bestCluster;
      }

      // Update step
      prevCentroids = centroids.map(c => [...c]);

      for (let j = 0; j < k; j++) {
        const clusterPoints = data.filter((_, i) => clusters[i] === j);

        if (clusterPoints.length > 0) {
          for (let d = 0; d < dimensions; d++) {
            centroids[j][d] = clusterPoints.reduce((sum, p) => sum + p[d], 0) / clusterPoints.length;
          }
        }
      }

      // Check convergence
      const maxChange = Math.max(...centroids.map((c, j) =>
        this.euclideanDistance(c, prevCentroids[j])
      ));

      if (maxChange < tolerance) {
        break;
      }
    }

    // Calculate inertia (within-cluster sum of squares)
    let inertia = 0;
    for (let i = 0; i < n; i++) {
      const dist = this.euclideanDistance(data[i], centroids[clusters[i]]);
      inertia += dist * dist;
    }

    return {
      clusters,
      centroids,
      inertia,
      iterations,
    };
  }

  /**
   * K-Means++ Initialization
   */
  private kMeansPlusPlus(data: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    const n = data.length;

    // Choose first centroid randomly
    const firstIndex = Math.floor(Math.random() * n);
    centroids.push([...data[firstIndex]]);

    // Choose remaining centroids
    for (let i = 1; i < k; i++) {
      const distances = data.map(point => {
        const minDist = Math.min(...centroids.map(c => this.euclideanDistance(point, c)));
        return minDist * minDist;
      });

      const sum = distances.reduce((a, b) => a + b, 0);
      let rand = Math.random() * sum;

      for (let j = 0; j < n; j++) {
        rand -= distances[j];
        if (rand <= 0) {
          centroids.push([...data[j]]);
          break;
        }
      }
    }

    return centroids;
  }

  /**
   * DBSCAN Clustering (Density-Based Spatial Clustering)
   */
  dbscan(
    data: number[][],
    epsilon: number,
    minPoints: number
  ): DBSCANResult {
    const n = data.length;
    const labels = new Array(n).fill(-1); // -1 = unvisited, -2 = noise
    const corePoints: number[] = [];
    const noise: number[] = [];
    let clusterId = 0;

    const getNeighbors = (pointIndex: number): number[] => {
      const neighbors: number[] = [];
      for (let i = 0; i < n; i++) {
        if (i !== pointIndex && this.euclideanDistance(data[pointIndex], data[i]) <= epsilon) {
          neighbors.push(i);
        }
      }
      return neighbors;
    };

    const expandCluster = (pointIndex: number, neighbors: number[], clusterId: number) => {
      labels[pointIndex] = clusterId;
      const queue = [...neighbors];

      while (queue.length > 0) {
        const currentIndex = queue.shift()!;

        if (labels[currentIndex] === -2) {
          labels[currentIndex] = clusterId;
        }

        if (labels[currentIndex] !== -1) continue;

        labels[currentIndex] = clusterId;
        const currentNeighbors = getNeighbors(currentIndex);

        if (currentNeighbors.length >= minPoints) {
          queue.push(...currentNeighbors);
        }
      }
    };

    for (let i = 0; i < n; i++) {
      if (labels[i] !== -1) continue;

      const neighbors = getNeighbors(i);

      if (neighbors.length < minPoints) {
        labels[i] = -2; // Mark as noise
        noise.push(i);
      } else {
        corePoints.push(i);
        expandCluster(i, neighbors, clusterId);
        clusterId++;
      }
    }

    return {
      clusters: labels.map(l => (l === -2 ? -1 : l)),
      labels,
      corePoints,
      noise,
    };
  }

  /**
   * Elbow Method - Find optimal k for k-means
   */
  findOptimalK(
    data: number[][],
    maxK: number = 10,
    trials: number = 5
  ): { k: number; inertias: number[]; scores: number[] } {
    const inertias: number[] = [];
    const scores: number[] = [];

    for (let k = 1; k <= maxK; k++) {
      // Run multiple trials and take average
      const trialInertias: number[] = [];

      for (let t = 0; t < trials; t++) {
        const result = this.kMeans(data, k);
        trialInertias.push(result.inertia);
      }

      const avgInertia = trialInertias.reduce((a, b) => a + b, 0) / trials;
      inertias.push(avgInertia);

      // Calculate elbow score (second derivative)
      if (k >= 3) {
        const score = inertias[k - 3] - 2 * inertias[k - 2] + inertias[k - 1];
        scores.push(score);
      }
    }

    // Find k with maximum score (elbow point)
    const optimalK = scores.indexOf(Math.max(...scores)) + 3;

    return {
      k: optimalK,
      inertias,
      scores,
    };
  }

  /**
   * Silhouette Score - Measure cluster quality
   */
  silhouetteScore(data: number[][], clusters: number[]): number {
    const n = data.length;
    const k = Math.max(...clusters) + 1;

    const scores = data.map((point, i) => {
      const ownCluster = clusters[i];
      const clusterPoints = data.filter((_, j) => clusters[j] === ownCluster && j !== i);

      if (clusterPoints.length === 0) return 0;

      // Calculate a(i) - average distance to points in same cluster
      const a = clusterPoints.reduce((sum, p) => sum + this.euclideanDistance(point, p), 0) / clusterPoints.length;

      // Calculate b(i) - min average distance to points in other clusters
      let b = Infinity;
      for (let c = 0; c < k; c++) {
        if (c === ownCluster) continue;

        const otherClusterPoints = data.filter((_, j) => clusters[j] === c);
        if (otherClusterPoints.length === 0) continue;

        const avgDist = otherClusterPoints.reduce((sum, p) => sum + this.euclideanDistance(point, p), 0) / otherClusterPoints.length;
        b = Math.min(b, avgDist);
      }

      return (b - a) / Math.max(a, b);
    });

    return scores.reduce((sum, s) => sum + s, 0) / n;
  }

  /**
   * Euclidean Distance
   */
  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  /**
   * Manhattan Distance
   */
  manhattanDistance(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0);
  }

  /**
   * Cosine Similarity
   */
  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  }
}
