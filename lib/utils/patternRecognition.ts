/**
 * Pattern recognition utilities
 */

export interface Pattern {
  type: 'increasing' | 'decreasing' | 'stable' | 'cyclic' | 'irregular';
  confidence: number;
  description: string;
}

export interface CyclicPattern {
  period: number;
  amplitude: number;
  phase: number;
  confidence: number;
}

/**
 * Recognize overall pattern in data
 */
export function recognizePattern(data: number[]): Pattern {
  if (data.length < 3) {
    return {
      type: 'irregular',
      confidence: 0,
      description: 'Insufficient data for pattern recognition',
    };
  }

  // Check for linear trends
  const trendStrength = calculateTrendStrength(data);

  if (trendStrength > 0.7) {
    return {
      type: 'increasing',
      confidence: trendStrength,
      description: 'Data shows a strong increasing trend',
    };
  } else if (trendStrength < -0.7) {
    return {
      type: 'decreasing',
      confidence: Math.abs(trendStrength),
      description: 'Data shows a strong decreasing trend',
    };
  }

  // Check for cyclic patterns
  const cyclicPattern = detectCyclicPattern(data);

  if (cyclicPattern && cyclicPattern.confidence > 0.6) {
    return {
      type: 'cyclic',
      confidence: cyclicPattern.confidence,
      description: `Data shows cyclic behavior with period of approximately ${cyclicPattern.period} units`,
    };
  }

  // Check for stability
  const variance = calculateVariance(data);
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const cv = Math.sqrt(variance) / mean; // Coefficient of variation

  if (cv < 0.1) {
    return {
      type: 'stable',
      confidence: 1 - cv,
      description: 'Data is relatively stable with low variation',
    };
  }

  return {
    type: 'irregular',
    confidence: 0.5,
    description: 'Data shows irregular patterns without clear trends',
  };
}

function calculateTrendStrength(data: number[]): number {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (data[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = numerator / denominator;
  const yRange = Math.max(...data) - Math.min(...data);

  // Normalize slope by data range
  return slope / (yRange / n);
}

function calculateVariance(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
}

/**
 * Detect cyclic patterns using autocorrelation
 */
export function detectCyclicPattern(data: number[]): CyclicPattern | null {
  if (data.length < 10) return null;

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const centered = data.map((val) => val - mean);

  // Calculate autocorrelation for different lags
  const maxLag = Math.min(Math.floor(data.length / 2), 30);
  const autocorrelations: Array<{ lag: number; correlation: number }> = [];

  for (let lag = 1; lag <= maxLag; lag++) {
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < data.length - lag; i++) {
      numerator += centered[i] * centered[i + lag];
    }

    for (let i = 0; i < data.length; i++) {
      denominator += centered[i] ** 2;
    }

    const correlation = numerator / denominator;
    autocorrelations.push({ lag, correlation });
  }

  // Find peaks in autocorrelation (excluding lag=0)
  const peaks = autocorrelations.filter((ac, i) => {
    if (i === 0 || i === autocorrelations.length - 1) return false;
    return (
      ac.correlation > autocorrelations[i - 1].correlation &&
      ac.correlation > autocorrelations[i + 1].correlation &&
      ac.correlation > 0.3
    );
  });

  if (peaks.length === 0) return null;

  // Find strongest peak
  const strongestPeak = peaks.reduce((max, peak) =>
    peak.correlation > max.correlation ? peak : max
  );

  // Estimate amplitude and phase
  const amplitude = Math.max(...data) - Math.min(...data);

  return {
    period: strongestPeak.lag,
    amplitude,
    phase: 0,
    confidence: strongestPeak.correlation,
  };
}

/**
 * Detect day-of-week patterns
 */
export function detectDayOfWeekPattern(
  data: Array<{ dayOfWeek: number; value: number }>
): Record<number, { average: number; variance: number }> {
  const dayData: Record<number, number[]> = {};

  data.forEach((item) => {
    if (!dayData[item.dayOfWeek]) {
      dayData[item.dayOfWeek] = [];
    }
    dayData[item.dayOfWeek].push(item.value);
  });

  const result: Record<number, { average: number; variance: number }> = {};

  Object.keys(dayData).forEach((day) => {
    const values = dayData[Number(day)];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;

    result[Number(day)] = { average, variance };
  });

  return result;
}

/**
 * Find recurring sequences
 */
export function findRecurringSequences(
  data: number[],
  minLength: number = 3,
  maxLength: number = 7
): Array<{ sequence: number[]; occurrences: number; positions: number[] }> {
  const sequences: Map<string, { sequence: number[]; positions: number[] }> = new Map();

  for (let length = minLength; length <= Math.min(maxLength, data.length); length++) {
    for (let i = 0; i <= data.length - length; i++) {
      const sequence = data.slice(i, i + length);
      const key = sequence.join(',');

      if (!sequences.has(key)) {
        sequences.set(key, { sequence, positions: [i] });
      } else {
        sequences.get(key)!.positions.push(i);
      }
    }
  }

  // Filter to only recurring sequences (occurred more than once)
  const recurring = Array.from(sequences.values())
    .filter((seq) => seq.positions.length > 1)
    .map((seq) => ({
      sequence: seq.sequence,
      occurrences: seq.positions.length,
      positions: seq.positions,
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  return recurring;
}

/**
 * Detect breakpoints in data (changepoint detection)
 */
export function detectBreakpoints(
  data: number[],
  minSegmentLength: number = 5
): number[] {
  if (data.length < minSegmentLength * 2) return [];

  const breakpoints: number[] = [];

  for (let i = minSegmentLength; i < data.length - minSegmentLength; i++) {
    const before = data.slice(i - minSegmentLength, i);
    const after = data.slice(i, i + minSegmentLength);

    const meanBefore = before.reduce((sum, val) => sum + val, 0) / before.length;
    const meanAfter = after.reduce((sum, val) => sum + val, 0) / after.length;

    const varBefore = before.reduce((sum, val) => sum + Math.pow(val - meanBefore, 2), 0) / before.length;
    const varAfter = after.reduce((sum, val) => sum + Math.pow(val - meanAfter, 2), 0) / after.length;

    // Detect significant change in mean or variance
    const meanChange = Math.abs(meanAfter - meanBefore);
    const varChange = Math.abs(varAfter - varBefore);

    if (meanChange > meanBefore * 0.3 || varChange > varBefore * 0.5) {
      breakpoints.push(i);
    }
  }

  return breakpoints;
}
