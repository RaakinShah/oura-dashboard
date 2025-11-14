/**
 * Data interpolation and filling utilities
 */

export type InterpolationMethod = 'linear' | 'polynomial' | 'spline' | 'nearest' | 'forward' | 'backward';

/**
 * Fill missing values in dataset
 */
export function fillMissing(
  data: (number | null)[],
  method: InterpolationMethod = 'linear'
): number[] {
  const result = [...data];

  switch (method) {
    case 'linear':
      return linearInterpolation(result);
    case 'forward':
      return forwardFill(result);
    case 'backward':
      return backwardFill(result);
    case 'nearest':
      return nearestFill(result);
    default:
      return linearInterpolation(result);
  }
}

/**
 * Linear interpolation
 */
function linearInterpolation(data: (number | null)[]): number[] {
  const result = [...data];

  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      // Find previous and next non-null values
      let prev: { index: number; value: number } | null = null;
      let next: { index: number; value: number } | null = null;

      for (let j = i - 1; j >= 0; j--) {
        if (result[j] !== null) {
          prev = { index: j, value: result[j]! };
          break;
        }
      }

      for (let j = i + 1; j < result.length; j++) {
        if (result[j] !== null) {
          next = { index: j, value: result[j]! };
          break;
        }
      }

      if (prev && next) {
        // Linear interpolation
        const slope = (next.value - prev.value) / (next.index - prev.index);
        result[i] = prev.value + slope * (i - prev.index);
      } else if (prev) {
        result[i] = prev.value;
      } else if (next) {
        result[i] = next.value;
      } else {
        result[i] = 0; // Default value
      }
    }
  }

  return result as number[];
}

/**
 * Forward fill (propagate last valid value)
 */
function forwardFill(data: (number | null)[]): number[] {
  const result = [...data];
  let lastValid: number | null = null;

  for (let i = 0; i < result.length; i++) {
    if (result[i] !== null) {
      lastValid = result[i];
    } else if (lastValid !== null) {
      result[i] = lastValid;
    } else {
      result[i] = 0;
    }
  }

  return result as number[];
}

/**
 * Backward fill (propagate next valid value)
 */
function backwardFill(data: (number | null)[]): number[] {
  const result = [...data];
  let nextValid: number | null = null;

  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] !== null) {
      nextValid = result[i];
    } else if (nextValid !== null) {
      result[i] = nextValid;
    } else {
      result[i] = 0;
    }
  }

  return result as number[];
}

/**
 * Nearest neighbor fill
 */
function nearestFill(data: (number | null)[]): number[] {
  const result = [...data];

  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      let minDistance = Infinity;
      let nearestValue = 0;

      for (let j = 0; j < result.length; j++) {
        if (result[j] !== null && Math.abs(j - i) < minDistance) {
          minDistance = Math.abs(j - i);
          nearestValue = result[j]!;
        }
      }

      result[i] = nearestValue;
    }
  }

  return result as number[];
}

/**
 * Interpolate to specific length (resample)
 */
export function resample(data: number[], targetLength: number): number[] {
  if (targetLength === data.length) return [...data];

  const result: number[] = [];
  const step = (data.length - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const position = i * step;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.min(lowerIndex + 1, data.length - 1);
    const fraction = position - lowerIndex;

    if (lowerIndex === upperIndex) {
      result.push(data[lowerIndex]);
    } else {
      const interpolated = data[lowerIndex] * (1 - fraction) + data[upperIndex] * fraction;
      result.push(interpolated);
    }
  }

  return result;
}

/**
 * Smooth data using moving average
 */
export function smoothData(data: number[], windowSize: number = 3): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(average);
  }

  return result;
}

/**
 * Upsample data by repeating values
 */
export function upsample(data: number[], factor: number): number[] {
  const result: number[] = [];

  data.forEach((value) => {
    for (let i = 0; i < factor; i++) {
      result.push(value);
    }
  });

  return result;
}

/**
 * Downsample data by averaging
 */
export function downsample(data: number[], factor: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i += factor) {
    const window = data.slice(i, i + factor);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(average);
  }

  return result;
}

/**
 * Fill gaps in time series data
 */
export function fillTimeSeriesGaps(
  data: Array<{ timestamp: Date; value: number }>,
  intervalMs: number
): Array<{ timestamp: Date; value: number }> {
  if (data.length === 0) return [];

  const sorted = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const result: Array<{ timestamp: Date; value: number }> = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevTime = sorted[i - 1].timestamp.getTime();
    const currTime = sorted[i].timestamp.getTime();
    const gap = currTime - prevTime;

    if (gap > intervalMs) {
      // Fill gap with interpolated values
      const steps = Math.floor(gap / intervalMs);
      const valueStep = (sorted[i].value - sorted[i - 1].value) / (steps + 1);

      for (let j = 1; j <= steps; j++) {
        result.push({
          timestamp: new Date(prevTime + j * intervalMs),
          value: sorted[i - 1].value + j * valueStep,
        });
      }
    }

    result.push(sorted[i]);
  }

  return result;
}
