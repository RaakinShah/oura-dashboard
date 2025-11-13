/**
 * Advanced data filtering utilities
 */

export interface FilterCriteria {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'between' | 'in';
  value: any;
  value2?: any; // For 'between' operator
}

/**
 * Filter data based on multiple criteria
 */
export function filterData<T extends Record<string, any>>(
  data: T[],
  criteria: FilterCriteria[]
): T[] {
  return data.filter((item) => {
    return criteria.every((criterion) => {
      const fieldValue = item[criterion.field];

      switch (criterion.operator) {
        case 'equals':
          return fieldValue === criterion.value;
        case 'notEquals':
          return fieldValue !== criterion.value;
        case 'greaterThan':
          return fieldValue > criterion.value;
        case 'lessThan':
          return fieldValue < criterion.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(criterion.value).toLowerCase());
        case 'between':
          return fieldValue >= criterion.value && fieldValue <= criterion.value2;
        case 'in':
          return Array.isArray(criterion.value) && criterion.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
}

/**
 * Filter by date range
 */
export function filterByDateRange<T extends { date: Date | string }>(
  data: T[],
  startDate: Date,
  endDate: Date
): T[] {
  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Filter top N items by a field
 */
export function filterTopN<T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  n: number,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  const sorted = [...data].sort((a, b) => {
    const valA = a[field];
    const valB = b[field];
    return order === 'desc' ? valB - valA : valA - valB;
  });

  return sorted.slice(0, n);
}

/**
 * Filter outliers
 */
export function filterOutliers<T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  method: 'iqr' | 'zscore' = 'iqr'
): T[] {
  const values = data.map((item) => Number(item[field]));

  if (method === 'iqr') {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter((item) => {
      const value = Number(item[field]);
      return value >= lowerBound && value <= upperBound;
    });
  } else {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return data.filter((item) => {
      const value = Number(item[field]);
      const zScore = Math.abs((value - mean) / stdDev);
      return zScore <= 3;
    });
  }
}

/**
 * Advanced search with fuzzy matching
 */
export function fuzzySearch<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  fields: (keyof T)[],
  threshold: number = 0.6
): T[] {
  const normalizedSearch = searchTerm.toLowerCase();

  return data
    .map((item) => {
      let maxScore = 0;

      fields.forEach((field) => {
        const fieldValue = String(item[field]).toLowerCase();
        const score = calculateSimilarity(normalizedSearch, fieldValue);
        maxScore = Math.max(maxScore, score);
      });

      return { item, score: maxScore };
    })
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(str1.length, str2.length);
  const distance = matrix[str2.length][str1.length];
  return 1 - distance / maxLength;
}

/**
 * Filter duplicates by key
 */
export function filterDuplicates<T extends Record<string, any>>(
  data: T[],
  key: keyof T
): T[] {
  const seen = new Set();
  return data.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Filter by percentile range
 */
export function filterByPercentile<T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  minPercentile: number,
  maxPercentile: number
): T[] {
  const values = data.map((item) => Number(item[field]));
  const sorted = [...values].sort((a, b) => a - b);

  const minIndex = Math.floor((minPercentile / 100) * sorted.length);
  const maxIndex = Math.ceil((maxPercentile / 100) * sorted.length);

  const minValue = sorted[minIndex];
  const maxValue = sorted[maxIndex];

  return data.filter((item) => {
    const value = Number(item[field]);
    return value >= minValue && value <= maxValue;
  });
}
