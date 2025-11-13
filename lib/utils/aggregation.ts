/**
 * Data aggregation utilities
 */

export type AggregationMethod = 'sum' | 'average' | 'min' | 'max' | 'count' | 'median';

export interface AggregationOptions {
  method: AggregationMethod;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

/**
 * Aggregate data by time period
 */
export function aggregateByPeriod<T extends { date: Date | string; [key: string]: any }>(
  data: T[],
  valueField: keyof T,
  period: 'day' | 'week' | 'month' | 'year',
  method: AggregationMethod = 'average'
): Array<{ period: string; value: number }> {
  const grouped = new Map<string, number[]>();

  data.forEach((item) => {
    const date = new Date(item.date);
    const key = getPeriodKey(date, period);
    const value = Number(item[valueField]);

    if (!isNaN(value)) {
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(value);
    }
  });

  const result: Array<{ period: string; value: number }> = [];

  grouped.forEach((values, period) => {
    result.push({
      period,
      value: aggregate(values, method),
    });
  });

  return result.sort((a, b) => a.period.localeCompare(b.period));
}

function getPeriodKey(date: Date, period: 'day' | 'week' | 'month' | 'year'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (period) {
    case 'day':
      return `${year}-${month}-${day}`;
    case 'week':
      const week = getWeekNumber(date);
      return `${year}-W${String(week).padStart(2, '0')}`;
    case 'month':
      return `${year}-${month}`;
    case 'year':
      return String(year);
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function aggregate(values: number[], method: AggregationMethod): number {
  if (values.length === 0) return 0;

  switch (method) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'average':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'count':
      return values.length;
    case 'median':
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
  }
}

/**
 * Group data by custom function
 */
export function groupBy<T>(
  data: T[],
  keyFn: (item: T) => string
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  data.forEach((item) => {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  return groups;
}

/**
 * Calculate rolling aggregation
 */
export function rollingAggregate(
  data: number[],
  window: number,
  method: AggregationMethod = 'average'
): number[] {
  if (window <= 0 || window > data.length) {
    throw new Error('Invalid window size');
  }

  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const windowData = data.slice(i - window + 1, i + 1);
      result.push(aggregate(windowData, method));
    }
  }

  return result;
}

/**
 * Pivot data for cross-tabulation
 */
export function pivot<T extends Record<string, any>>(
  data: T[],
  rowKey: keyof T,
  colKey: keyof T,
  valueKey: keyof T,
  aggMethod: AggregationMethod = 'sum'
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};

  data.forEach((item) => {
    const row = String(item[rowKey]);
    const col = String(item[colKey]);
    const value = Number(item[valueKey]);

    if (!result[row]) {
      result[row] = {};
    }
    if (!result[row][col]) {
      result[row][col] = value;
    } else {
      // Aggregate multiple values
      const existing = result[row][col];
      result[row][col] = aggregate([existing, value], aggMethod);
    }
  });

  return result;
}
