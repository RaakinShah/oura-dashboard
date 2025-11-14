/**
 * K-Means and DBSCAN Clustering Algorithms
 */

export interface DataPoint {
  features: number[];
  label?: number;
}

export class KMeans {
  private k: number;
  private maxIterations: number;
  private centroids: number[][];

  constructor(k: number, maxIterations: number = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.centroids = [];
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  private initializeCentroids(data: DataPoint[]) {
    // K-Means++ initialization
    this.centroids = [data[Math.floor(Math.random() * data.length)].features];

    for (let i = 1; i < this.k; i++) {
      const distances = data.map(point => {
        const minDist = Math.min(...this.centroids.map(c => 
          this.euclideanDistance(point.features, c)
        ));
        return minDist * minDist;
      });

      const sum = distances.reduce((a, b) => a + b, 0);
      const rand = Math.random() * sum;
      
      let cumsum = 0;
      for (let j = 0; j < data.length; j++) {
        cumsum += distances[j];
        if (cumsum >= rand) {
          this.centroids.push(data[j].features);
          break;
        }
      }
    }
  }

  fit(data: DataPoint[]): number[] {
    this.initializeCentroids(data);

    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Assign points to nearest centroid
      const clusters: number[][] = Array(this.k).fill(null).map(() => []);
      
      data.forEach((point, idx) => {
        const distances = this.centroids.map(c => 
          this.euclideanDistance(point.features, c)
        );
        const nearest = distances.indexOf(Math.min(...distances));
        clusters[nearest].push(idx);
      });

      // Update centroids
      const newCentroids: number[][] = [];
      let converged = true;

      for (let i = 0; i < this.k; i++) {
        if (clusters[i].length === 0) {
          newCentroids.push(this.centroids[i]);
          continue;
        }

        const newCentroid = new Array(data[0].features.length).fill(0);
        
        clusters[i].forEach(idx => {
          data[idx].features.forEach((val, j) => {
            newCentroid[j] += val;
          });
        });

        newCentroid.forEach((val, j, arr) => {
          arr[j] = val / clusters[i].length;
        });

        if (this.euclideanDistance(newCentroid, this.centroids[i]) > 0.001) {
          converged = false;
        }

        newCentroids.push(newCentroid);
      }

      this.centroids = newCentroids;

      if (converged) {
        console.log(`Converged after ${iter + 1} iterations`);
        break;
      }
    }

    // Return final cluster assignments
    return data.map(point => {
      const distances = this.centroids.map(c => 
        this.euclideanDistance(point.features, c)
      );
      return distances.indexOf(Math.min(...distances));
    });
  }

  predict(point: number[]): number {
    const distances = this.centroids.map(c => 
      this.euclideanDistance(point, c)
    );
    return distances.indexOf(Math.min(...distances));
  }

  getCentroids(): number[][] {
    return this.centroids;
  }
}

export class DBSCAN {
  private epsilon: number;
  private minPoints: number;

  constructor(epsilon: number, minPoints: number) {
    this.epsilon = epsilon;
    this.minPoints = minPoints;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  private getNeighbors(data: DataPoint[], pointIdx: number): number[] {
    return data
      .map((point, idx) => ({
        idx,
        dist: this.euclideanDistance(data[pointIdx].features, point.features),
      }))
      .filter(item => item.dist <= this.epsilon)
      .map(item => item.idx);
  }

  fit(data: DataPoint[]): number[] {
    const labels = new Array(data.length).fill(-1);
    let clusterId = 0;

    for (let i = 0; i < data.length; i++) {
      if (labels[i] !== -1) continue;

      const neighbors = this.getNeighbors(data, i);

      if (neighbors.length < this.minPoints) {
        labels[i] = -1; // Noise point
        continue;
      }

      // Start new cluster
      labels[i] = clusterId;
      const queue = [...neighbors.filter(n => n !== i)];

      while (queue.length > 0) {
        const pointIdx = queue.shift()!;

        if (labels[pointIdx] === -1) {
          labels[pointIdx] = clusterId;
        }

        if (labels[pointIdx] !== -1) continue;

        labels[pointIdx] = clusterId;

        const pointNeighbors = this.getNeighbors(data, pointIdx);

        if (pointNeighbors.length >= this.minPoints) {
          queue.push(...pointNeighbors.filter(n => labels[n] === -1));
        }
      }

      clusterId++;
    }

    return labels;
  }
}
