/**
 * Data quality assessment utilities
 */

export interface DataQualityReport {
  overall: number; // 0-100
  completeness: number;
  consistency: number;
  accuracy: number;
  timeliness: number;
  issues: DataQualityIssue[];
  recommendations: string[];
}

export interface DataQualityIssue {
  type: 'missing' | 'duplicate' | 'outlier' | 'invalid' | 'inconsistent' | 'stale';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedRecords: number;
  field?: string;
}

/**
 * Assess data quality comprehensively
 */
export function assessDataQuality<T extends Record<string, any>>(
  data: T[],
  requiredFields: (keyof T)[],
  validationRules?: Record<keyof T, (value: any) => boolean>
): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const recommendations: string[] = [];

  // Completeness check
  const completeness = assessCompleteness(data, requiredFields, issues);

  // Consistency check
  const consistency = assessConsistency(data, issues);

  // Accuracy check (using validation rules if provided)
  const accuracy = validationRules
    ? assessAccuracy(data, validationRules, issues)
    : 100;

  // Timeliness check (if data has timestamps)
  const timeliness = assessTimeliness(data, issues);

  // Overall score (weighted average)
  const overall = Math.round(
    completeness * 0.3 +
    consistency * 0.25 +
    accuracy * 0.3 +
    timeliness * 0.15
  );

  // Generate recommendations
  if (completeness < 90) {
    recommendations.push('Improve data collection to reduce missing values');
  }
  if (consistency < 80) {
    recommendations.push('Review data entry processes for consistency');
  }
  if (accuracy < 85) {
    recommendations.push('Implement validation checks during data collection');
  }
  if (timeliness < 90) {
    recommendations.push('Ensure regular and timely data updates');
  }

  return {
    overall,
    completeness,
    consistency,
    accuracy,
    timeliness,
    issues,
    recommendations,
  };
}

function assessCompleteness<T extends Record<string, any>>(
  data: T[],
  requiredFields: (keyof T)[],
  issues: DataQualityIssue[]
): number {
  if (data.length === 0) return 0;

  let totalFields = data.length * requiredFields.length;
  let missingCount = 0;

  const fieldMissing: Record<string, number> = {};

  data.forEach((record) => {
    requiredFields.forEach((field) => {
      if (record[field] === null || record[field] === undefined || record[field] === '') {
        missingCount++;
        fieldMissing[String(field)] = (fieldMissing[String(field)] || 0) + 1;
      }
    });
  });

  // Report fields with significant missing data
  Object.keys(fieldMissing).forEach((field) => {
    const missingPercent = (fieldMissing[field] / data.length) * 100;
    if (missingPercent > 10) {
      issues.push({
        type: 'missing',
        severity: missingPercent > 30 ? 'high' : missingPercent > 20 ? 'medium' : 'low',
        description: `Field '${field}' is missing in ${missingPercent.toFixed(1)}% of records`,
        affectedRecords: fieldMissing[field],
        field,
      });
    }
  });

  return ((totalFields - missingCount) / totalFields) * 100;
}

function assessConsistency<T extends Record<string, any>>(
  data: T[],
  issues: DataQualityIssue[]
): number {
  if (data.length === 0) return 100;

  let consistencyScore = 100;

  // Check for duplicates (if data has an id field)
  if ('id' in data[0]) {
    const ids = data.map((record) => record.id);
    const uniqueIds = new Set(ids);
    const duplicateCount = ids.length - uniqueIds.size;

    if (duplicateCount > 0) {
      consistencyScore -= Math.min(30, (duplicateCount / data.length) * 100);
      issues.push({
        type: 'duplicate',
        severity: duplicateCount > data.length * 0.1 ? 'high' : 'medium',
        description: `Found ${duplicateCount} duplicate records`,
        affectedRecords: duplicateCount,
      });
    }
  }

  // Check for data type consistency
  Object.keys(data[0]).forEach((field) => {
    const types = new Set(data.map((record) => typeof record[field]));
    if (types.size > 1) {
      consistencyScore -= 5;
      issues.push({
        type: 'inconsistent',
        severity: 'medium',
        description: `Field '${field}' has inconsistent data types`,
        affectedRecords: data.length,
        field,
      });
    }
  });

  return Math.max(0, consistencyScore);
}

function assessAccuracy<T extends Record<string, any>>(
  data: T[],
  validationRules: Record<keyof T, (value: any) => boolean>,
  issues: DataQualityIssue[]
): number {
  if (data.length === 0) return 100;

  let invalidCount = 0;
  const fieldInvalid: Record<string, number> = {};

  data.forEach((record) => {
    Object.keys(validationRules).forEach((field) => {
      const validator = validationRules[field as keyof T];
      if (!validator(record[field])) {
        invalidCount++;
        fieldInvalid[String(field)] = (fieldInvalid[String(field)] || 0) + 1;
      }
    });
  });

  Object.keys(fieldInvalid).forEach((field) => {
    const invalidPercent = (fieldInvalid[field] / data.length) * 100;
    if (invalidPercent > 5) {
      issues.push({
        type: 'invalid',
        severity: invalidPercent > 20 ? 'high' : invalidPercent > 10 ? 'medium' : 'low',
        description: `Field '${field}' has invalid values in ${invalidPercent.toFixed(1)}% of records`,
        affectedRecords: fieldInvalid[field],
        field,
      });
    }
  });

  const totalValidations = data.length * Object.keys(validationRules).length;
  return ((totalValidations - invalidCount) / totalValidations) * 100;
}

function assessTimeliness<T extends Record<string, any>>(
  data: T[],
  issues: DataQualityIssue[]
): number {
  if (data.length === 0) return 100;

  // Check if data has a date/timestamp field
  const dateField = Object.keys(data[0]).find(
    (key) => key.includes('date') || key.includes('time') || key.includes('timestamp')
  );

  if (!dateField) return 100; // No timestamp field, assume timely

  let timelinessScore = 100;
  const now = new Date();
  let staleCount = 0;

  data.forEach((record) => {
    const date = new Date(record[dateField]);
    const ageMs = now.getTime() - date.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays > 30) {
      staleCount++;
    }
  });

  if (staleCount > 0) {
    const stalePercent = (staleCount / data.length) * 100;
    timelinessScore -= Math.min(50, stalePercent);

    if (stalePercent > 10) {
      issues.push({
        type: 'stale',
        severity: stalePercent > 30 ? 'high' : stalePercent > 20 ? 'medium' : 'low',
        description: `${stalePercent.toFixed(1)}% of records are more than 30 days old`,
        affectedRecords: staleCount,
        field: dateField,
      });
    }
  }

  return Math.max(0, timelinessScore);
}

/**
 * Calculate data coverage percentage
 */
export function calculateCoverage(
  data: any[],
  expectedRecords: number
): number {
  return Math.min(100, (data.length / expectedRecords) * 100);
}

/**
 * Identify and count data anomalies
 */
export function countAnomalies(
  data: number[],
  method: 'iqr' | 'zscore' = 'iqr'
): {
  count: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
} {
  if (data.length === 0) {
    return { count: 0, percentage: 0, severity: 'low' };
  }

  // Use IQR method
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const anomalyCount = data.filter((val) => val < lowerBound || val > upperBound).length;
  const percentage = (anomalyCount / data.length) * 100;

  let severity: 'low' | 'medium' | 'high';
  if (percentage < 5) severity = 'low';
  else if (percentage < 15) severity = 'medium';
  else severity = 'high';

  return {
    count: anomalyCount,
    percentage,
    severity,
  };
}
