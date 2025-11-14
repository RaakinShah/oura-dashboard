/**
 * Anomaly detection utilities
 */

import { calculateStatistics } from './statistics';

export interface Anomaly {
  index: number;
  value: number;
  expected: number;
  deviation: number;
  severity: 'mild' | 'moderate' | 'severe';
  timestamp?: Date;
}

/**
 * Detect anomalies using statistical methods
 */
export function detectAnomalies(
  data: number[],
  sensitivity: number = 2.5
): Anomaly[] {
  const stats = calculateStatistics(data);
  const anomalies: Anomaly[] = [];

  data.forEach((value, index) => {
    const zScore = Math.abs((value - stats.mean) / stats.standardDeviation);

    if (zScore > sensitivity) {
      const deviation = value - stats.mean;
      let severity: 'mild' | 'moderate' | 'severe';

      if (zScore > sensitivity * 2) {
        severity = 'severe';
      } else if (zScore > sensitivity * 1.5) {
        severity = 'moderate';
      } else {
        severity = 'mild';
      }

      anomalies.push({
        index,
        value,
        expected: stats.mean,
        deviation,
        severity,
      });
    }
  });

  return anomalies;
}

/**
 * Detect anomalies in time series using moving average
 */
export function detectTimeSeriesAnomalies(
  data: Array<{ timestamp: Date; value: number }>,
  windowSize: number = 7,
  threshold: number = 2
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (let i = windowSize; i < data.length; i++) {
    // Calculate moving average and standard deviation
    const window = data.slice(i - windowSize, i).map((d) => d.value);
    const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
    const stdDev = Math.sqrt(variance);

    const value = data[i].value;
    const zScore = Math.abs((value - mean) / stdDev);

    if (zScore > threshold) {
      let severity: 'mild' | 'moderate' | 'severe';

      if (zScore > threshold * 2) {
        severity = 'severe';
      } else if (zScore > threshold * 1.5) {
        severity = 'moderate';
      } else {
        severity = 'mild';
      }

      anomalies.push({
        index: i,
        value,
        expected: mean,
        deviation: value - mean,
        severity,
        timestamp: data[i].timestamp,
      });
    }
  }

  return anomalies;
}

/**
 * Detect sudden spikes or drops
 */
export function detectSuddenChanges(
  data: number[],
  changeThreshold: number = 30
): Array<{
  index: number;
  type: 'spike' | 'drop';
  from: number;
  to: number;
  changePercent: number;
}> {
  const changes: Array<{
    index: number;
    type: 'spike' | 'drop';
    from: number;
    to: number;
    changePercent: number;
  }> = [];

  for (let i = 1; i < data.length; i++) {
    const from = data[i - 1];
    const to = data[i];
    const changePercent = ((to - from) / from) * 100;

    if (Math.abs(changePercent) > changeThreshold) {
      changes.push({
        index: i,
        type: changePercent > 0 ? 'spike' : 'drop',
        from,
        to,
        changePercent,
      });
    }
  }

  return changes;
}

/**
 * Detect cyclic patterns and deviations
 */
export function detectCyclicAnomalies(
  data: Array<{ dayOfWeek: number; value: number }>,
  threshold: number = 1.5
): Anomaly[] {
  // Calculate average for each day of week
  const dayAverages: Record<number, number[]> = {};

  data.forEach((item) => {
    if (!dayAverages[item.dayOfWeek]) {
      dayAverages[item.dayOfWeek] = [];
    }
    dayAverages[item.dayOfWeek].push(item.value);
  });

  const dayStats: Record<number, { mean: number; stdDev: number }> = {};
  Object.keys(dayAverages).forEach((day) => {
    const values = dayAverages[Number(day)];
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    dayStats[Number(day)] = {
      mean,
      stdDev: Math.sqrt(variance),
    };
  });

  const anomalies: Anomaly[] = [];

  data.forEach((item, index) => {
    const stats = dayStats[item.dayOfWeek];
    if (stats) {
      const zScore = Math.abs((item.value - stats.mean) / stats.stdDev);

      if (zScore > threshold) {
        let severity: 'mild' | 'moderate' | 'severe';

        if (zScore > threshold * 2) {
          severity = 'severe';
        } else if (zScore > threshold * 1.5) {
          severity = 'moderate';
        } else {
          severity = 'mild';
        }

        anomalies.push({
          index,
          value: item.value,
          expected: stats.mean,
          deviation: item.value - stats.mean,
          severity,
        });
      }
    }
  });

  return anomalies;
}

/**
 * Score anomaly severity (0-100)
 */
export function scoreAnomalySeverity(anomaly: Anomaly, context: {
  dataRange: { min: number; max: number };
  typical: { min: number; max: number };
}): number {
  // Distance from expected value
  const distanceScore = Math.min(50, Math.abs(anomaly.deviation) / context.dataRange.max * 50);

  // How far outside typical range
  let rangeScore = 0;
  if (anomaly.value < context.typical.min) {
    rangeScore = ((context.typical.min - anomaly.value) / context.typical.min) * 50;
  } else if (anomaly.value > context.typical.max) {
    rangeScore = ((anomaly.value - context.typical.max) / context.typical.max) * 50;
  }

  return Math.min(100, distanceScore + rangeScore);
}
