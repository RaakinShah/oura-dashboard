/**
 * Outlier Detection
 * Implements various methods for detecting outliers and anomalies
 */

export interface OutlierResult {
  outliers: number[];
  scores: number[];
  threshold: number;
  method: string;
}

export interface AnomalyScore {
  index: number;
  value: number;
  score: number;
  isAnomaly: boolean;
}

export class OutlierDetection {
  /**
   * Z-Score Method
   */
  zScore(data: number[], threshold: number = 3): OutlierResult {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

    const scores = data.map(val => Math.abs((val - mean) / stdDev));
    const outliers = data.map((_, i) => scores[i] > threshold ? i : -1).filter(i => i >= 0);

    return {
      outliers,
      scores,
      threshold,
      method: 'Z-Score',
    };
  }

  /**
   * Modified Z-Score (using MAD - Median Absolute Deviation)
   */
  modifiedZScore(data: number[], threshold: number = 3.5): OutlierResult {
    const median = this.median(data);
    const mad = this.median(data.map(val => Math.abs(val - median)));

    // Modified Z-score
    const scores = data.map(val => Math.abs(0.6745 * (val - median) / mad));
    const outliers = data.map((_, i) => scores[i] > threshold ? i : -1).filter(i => i >= 0);

    return {
      outliers,
      scores,
      threshold,
      method: 'Modified Z-Score (MAD)',
    };
  }

  /**
   * IQR (Interquartile Range) Method
   */
  iqr(data: number[], multiplier: number = 1.5): OutlierResult {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = this.percentile(sorted, 25);
    const q3 = this.percentile(sorted, 75);
    const iqr = q3 - q1;

    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;

    const scores = data.map(val => {
      if (val < lowerBound) return (lowerBound - val) / iqr;
      if (val > upperBound) return (val - upperBound) / iqr;
      return 0;
    });

    const outliers = data.map((val, i) =>
      val < lowerBound || val > upperBound ? i : -1
    ).filter(i => i >= 0);

    return {
      outliers,
      scores,
      threshold: multiplier,
      method: 'IQR',
    };
  }

  /**
   * Isolation Forest (simplified version)
   */
  isolationForest(
    data: number[],
    numTrees: number = 100,
    sampleSize?: number,
    contamination: number = 0.1
  ): OutlierResult {
    const n = data.length;
    const subsampleSize = sampleSize || Math.min(256, n);

    // Build trees and calculate average path lengths
    const scores = data.map(val => {
      let avgPathLength = 0;

      for (let t = 0; t < numTrees; t++) {
        // Random sample
        const sample = this.randomSample(data, subsampleSize);
        avgPathLength += this.isolationTreePathLength(val, sample, 0);
      }

      return avgPathLength / numTrees;
    });

    // Normalize scores (shorter paths = more anomalous)
    const c = this.averagePathLength(subsampleSize);
    const anomalyScores = scores.map(s => Math.pow(2, -s / c));

    // Determine threshold based on contamination rate
    const sortedScores = [...anomalyScores].sort((a, b) => b - a);
    const thresholdIndex = Math.floor(n * contamination);
    const threshold = sortedScores[thresholdIndex];

    const outliers = anomalyScores.map((score, i) =>
      score >= threshold ? i : -1
    ).filter(i => i >= 0);

    return {
      outliers,
      scores: anomalyScores,
      threshold,
      method: 'Isolation Forest',
    };
  }

  /**
   * Local Outlier Factor (LOF)
   */
  lof(data: number[], k: number = 5): OutlierResult {
    const n = data.length;

    // Calculate k-distance for each point
    const kDistances = data.map((val, i) => {
      const distances = data.map((otherVal, j) =>
        i === j ? Infinity : Math.abs(val - otherVal)
      );
      distances.sort((a, b) => a - b);
      return distances[k - 1];
    });

    // Calculate local reachability density
    const lrd = data.map((val, i) => {
      const distances = data.map((otherVal, j) =>
        i === j ? Infinity : Math.abs(val - otherVal)
      );

      // Find k nearest neighbors
      const neighbors = distances
        .map((dist, j) => ({ dist, index: j }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, k);

      const reachDist = neighbors.reduce((sum, neighbor) =>
        sum + Math.max(distances[neighbor.index], kDistances[neighbor.index]), 0
      );

      return k / reachDist;
    });

    // Calculate LOF scores
    const scores = data.map((val, i) => {
      const distances = data.map((otherVal, j) =>
        i === j ? Infinity : Math.abs(val - otherVal)
      );

      const neighbors = distances
        .map((dist, j) => ({ dist, index: j }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, k);

      const avgNeighborLrd = neighbors.reduce((sum, neighbor) =>
        sum + lrd[neighbor.index], 0
      ) / k;

      return avgNeighborLrd / lrd[i];
    });

    // Points with LOF > 1.5 are considered outliers
    const threshold = 1.5;
    const outliers = scores.map((score, i) =>
      score > threshold ? i : -1
    ).filter(i => i >= 0);

    return {
      outliers,
      scores,
      threshold,
      method: 'Local Outlier Factor',
    };
  }

  /**
   * DBSCAN-based Outlier Detection
   */
  dbscanOutliers(data: number[], epsilon: number, minPoints: number = 3): OutlierResult {
    const n = data.length;
    const labels = new Array(n).fill(-1);

    const getNeighbors = (index: number): number[] => {
      return data.map((val, i) =>
        i !== index && Math.abs(val - data[index]) <= epsilon ? i : -1
      ).filter(i => i >= 0);
    };

    let clusterId = 0;

    for (let i = 0; i < n; i++) {
      if (labels[i] !== -1) continue;

      const neighbors = getNeighbors(i);

      if (neighbors.length < minPoints) {
        labels[i] = -2; // Noise point (outlier)
      } else {
        // Core point - start new cluster
        labels[i] = clusterId;
        const queue = [...neighbors];

        while (queue.length > 0) {
          const q = queue.shift()!;

          if (labels[q] === -2) labels[q] = clusterId;
          if (labels[q] !== -1) continue;

          labels[q] = clusterId;
          const qNeighbors = getNeighbors(q);

          if (qNeighbors.length >= minPoints) {
            queue.push(...qNeighbors);
          }
        }

        clusterId++;
      }
    }

    const outliers = labels.map((label, i) => label === -2 ? i : -1).filter(i => i >= 0);
    const scores = labels.map(label => label === -2 ? 1 : 0);

    return {
      outliers,
      scores,
      threshold: epsilon,
      method: 'DBSCAN',
    };
  }

  /**
   * Moving Average-based Anomaly Detection
   */
  movingAverageAnomaly(
    data: number[],
    window: number = 10,
    threshold: number = 3
  ): AnomalyScore[] {
    const result: AnomalyScore[] = [];

    for (let i = window; i < data.length; i++) {
      const windowData = data.slice(i - window, i);
      const mean = windowData.reduce((a, b) => a + b, 0) / window;
      const stdDev = Math.sqrt(
        windowData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window
      );

      const score = Math.abs((data[i] - mean) / stdDev);
      const isAnomaly = score > threshold;

      result.push({
        index: i,
        value: data[i],
        score,
        isAnomaly,
      });
    }

    return result;
  }

  /**
   * Helper: Calculate median
   */
  private median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Helper: Calculate percentile
   */
  private percentile(sortedData: number[], p: number): number {
    const index = (p / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  /**
   * Helper: Random sample
   */
  private randomSample(data: number[], size: number): number[] {
    const sample: number[] = [];
    const indices = new Set<number>();

    while (sample.length < size) {
      const index = Math.floor(Math.random() * data.length);
      if (!indices.has(index)) {
        indices.add(index);
        sample.push(data[index]);
      }
    }

    return sample;
  }

  /**
   * Helper: Isolation tree path length (simplified)
   */
  private isolationTreePathLength(
    value: number,
    sample: number[],
    currentDepth: number,
    maxDepth: number = 10
  ): number {
    if (sample.length <= 1 || currentDepth >= maxDepth) {
      return currentDepth + this.averagePathLength(sample.length);
    }

    const splitValue = sample[Math.floor(Math.random() * sample.length)];
    const left = sample.filter(v => v < splitValue);
    const right = sample.filter(v => v >= splitValue);

    if (value < splitValue && left.length > 0) {
      return this.isolationTreePathLength(value, left, currentDepth + 1, maxDepth);
    } else if (right.length > 0) {
      return this.isolationTreePathLength(value, right, currentDepth + 1, maxDepth);
    }

    return currentDepth;
  }

  /**
   * Helper: Average path length in binary search tree
   */
  private averagePathLength(n: number): number {
    if (n <= 1) return 0;
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
  }
}
