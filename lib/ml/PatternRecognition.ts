/**
 * Advanced Pattern Recognition and Anomaly Detection
 */

export interface Pattern {
  id: string;
  features: number[];
  label: string;
  confidence: number;
}

export class PatternRecognizer {
  private patterns: Pattern[] = [];
  private threshold: number;

  constructor(threshold: number = 0.8) {
    this.threshold = threshold;
  }

  /**
   * Dynamic Time Warping distance for comparing sequences
   */
  private dtwDistance(seq1: number[], seq2: number[]): number {
    const n = seq1.length;
    const m = seq2.length;
    const dtw: number[][] = Array(n + 1).fill(0).map(() => 
      Array(m + 1).fill(Infinity)
    );

    dtw[0][0] = 0;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = Math.abs(seq1[i - 1] - seq2[j - 1]);
        dtw[i][j] = cost + Math.min(
          dtw[i - 1][j],
          dtw[i][j - 1],
          dtw[i - 1][j - 1]
        );
      }
    }

    return dtw[n][m];
  }

  /**
   * Cosine similarity for feature comparison
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }

  addPattern(pattern: Pattern) {
    this.patterns.push(pattern);
  }

  recognize(features: number[]): Pattern | null {
    let bestMatch: Pattern | null = null;
    let bestScore = -Infinity;

    for (const pattern of this.patterns) {
      const similarity = this.cosineSimilarity(features, pattern.features);
      
      if (similarity > bestScore && similarity >= this.threshold) {
        bestScore = similarity;
        bestMatch = { ...pattern, confidence: similarity };
      }
    }

    return bestMatch;
  }

  recognizeSequence(sequence: number[]): Pattern | null {
    let bestMatch: Pattern | null = null;
    let bestScore = Infinity;

    for (const pattern of this.patterns) {
      const distance = this.dtwDistance(sequence, pattern.features);
      
      if (distance < bestScore) {
        bestScore = distance;
        const confidence = 1 / (1 + distance);
        if (confidence >= this.threshold) {
          bestMatch = { ...pattern, confidence };
        }
      }
    }

    return bestMatch;
  }

  getPatterns(): Pattern[] {
    return this.patterns;
  }
}

export class AnomalyDetector {
  private data: number[][] = [];
  private mean: number[] = [];
  private std: number[] = [];
  private threshold: number;

  constructor(threshold: number = 2.5) {
    this.threshold = threshold;
  }

  train(data: number[][]) {
    this.data = data;
    const n = data.length;
    const m = data[0].length;

    // Calculate mean
    this.mean = new Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) {
        this.mean[j] += data[i][j];
      }
      this.mean[j] /= n;
    }

    // Calculate standard deviation
    this.std = new Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) {
        this.std[j] += Math.pow(data[i][j] - this.mean[j], 2);
      }
      this.std[j] = Math.sqrt(this.std[j] / n);
    }
  }

  /**
   * Detect anomalies using Z-score method
   */
  detect(point: number[]): { isAnomaly: boolean; score: number; dimensions: number[] } {
    const zScores = point.map((val, i) => 
      Math.abs((val - this.mean[i]) / (this.std[i] || 1))
    );

    const maxZScore = Math.max(...zScores);
    const anomalousDimensions = zScores
      .map((score, i) => ({ score, index: i }))
      .filter(item => item.score > this.threshold)
      .map(item => item.index);

    return {
      isAnomaly: maxZScore > this.threshold,
      score: maxZScore,
      dimensions: anomalousDimensions,
    };
  }

  /**
   * Isolation Forest-like anomaly detection
   */
  isolationScore(point: number[], numTrees: number = 100): number {
    let avgPathLength = 0;

    for (let t = 0; t < numTrees; t++) {
      let pathLength = 0;
      let currentData = [...this.data];
      let currentPoint = [...point];

      while (currentData.length > 1 && pathLength < 10) {
        const dim = Math.floor(Math.random() * point.length);
        const splitValue = currentPoint[dim];

        const left = currentData.filter(p => p[dim] < splitValue);
        const right = currentData.filter(p => p[dim] >= splitValue);

        if (left.length === 0 || right.length === 0) break;

        currentData = currentPoint[dim] < splitValue ? left : right;
        pathLength++;
      }

      avgPathLength += pathLength;
    }

    avgPathLength /= numTrees;

    // Normalize score
    const c = 2 * (Math.log(this.data.length - 1) + 0.5772) - 
              (2 * (this.data.length - 1) / this.data.length);
    
    return Math.pow(2, -avgPathLength / c);
  }

  /**
   * Local Outlier Factor (LOF)
   */
  lof(point: number[], k: number = 5): number {
    const distances = this.data.map(p => ({
      point: p,
      dist: Math.sqrt(p.reduce((sum, val, i) => 
        sum + Math.pow(val - point[i], 2), 0
      ))
    })).sort((a, b) => a.dist - b.dist);

    const kNeighbors = distances.slice(0, k);
    const kDistance = kNeighbors[kNeighbors.length - 1].dist;

    const reachabilityDensity = k / kNeighbors.reduce((sum, n) => 
      sum + Math.max(n.dist, kDistance), 0
    );

    // Calculate LOF (simplified version)
    const neighborDensities = kNeighbors.map(n => {
      const neighborDistances = this.data.map(p => ({
        dist: Math.sqrt(p.reduce((sum, val, i) => 
          sum + Math.pow(val - n.point[i], 2), 0
        ))
      })).sort((a, b) => a.dist - b.dist).slice(0, k);

      return k / neighborDistances.reduce((sum, d) => 
        sum + d.dist, 0
      );
    });

    const avgNeighborDensity = neighborDensities.reduce((a, b) => 
      a + b, 0
    ) / k;

    return avgNeighborDensity / reachabilityDensity;
  }
}

/**
 * Trend Analysis
 */
export class TrendAnalyzer {
  /**
   * Detect trend direction
   */
  detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Calculate trend strength (R-squared)
   */
  trendStrength(data: number[]): number {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions = data.map((_, i) => slope * i + intercept);
    
    const ssRes = data.reduce((sum, val, i) => 
      sum + Math.pow(val - predictions[i], 2), 0
    );
    const ssTot = data.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    );

    return 1 - (ssRes / ssTot);
  }

  /**
   * Detect change points in time series
   */
  detectChangePoints(data: number[], minSegmentLength: number = 5): number[] {
    const changePoints: number[] = [];
    
    for (let i = minSegmentLength; i < data.length - minSegmentLength; i++) {
      const before = data.slice(Math.max(0, i - minSegmentLength), i);
      const after = data.slice(i, Math.min(data.length, i + minSegmentLength));

      const meanBefore = before.reduce((a, b) => a + b, 0) / before.length;
      const meanAfter = after.reduce((a, b) => a + b, 0) / after.length;

      if (Math.abs(meanAfter - meanBefore) / meanBefore > 0.2) {
        changePoints.push(i);
      }
    }

    return changePoints;
  }
}
