/**
 * Data validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'range' | 'pattern' | 'custom';
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
}

/**
 * Validate data against rules
 */
export function validateData(data: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          errors.push(rule.message || `${rule.field} is required`);
        }
        break;

      case 'range':
        if (typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(rule.message || `${rule.field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(rule.message || `${rule.field} must be at most ${rule.max}`);
          }
        }
        break;

      case 'pattern':
        if (rule.pattern && typeof value === 'string') {
          if (!rule.pattern.test(value)) {
            errors.push(rule.message || `${rule.field} has invalid format`);
          }
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          errors.push(rule.message || `${rule.field} is invalid`);
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Oura sleep data
 */
export function validateSleepData(data: any): ValidationResult {
  const rules: ValidationRule[] = [
    { field: 'total_sleep_duration', type: 'range', min: 0, max: 86400 },
    { field: 'efficiency', type: 'range', min: 0, max: 100 },
    { field: 'restfulness', type: 'range', min: 0, max: 100 },
    { field: 'rem_sleep_duration', type: 'range', min: 0, max: 86400 },
    { field: 'deep_sleep_duration', type: 'range', min: 0, max: 86400 },
    { field: 'light_sleep_duration', type: 'range', min: 0, max: 86400 },
  ];

  return validateData(data, rules);
}

/**
 * Validate Oura activity data
 */
export function validateActivityData(data: any): ValidationResult {
  const rules: ValidationRule[] = [
    { field: 'steps', type: 'range', min: 0, max: 100000 },
    { field: 'cal_total', type: 'range', min: 0, max: 10000 },
    { field: 'cal_active', type: 'range', min: 0, max: 10000 },
    { field: 'met_min_medium', type: 'range', min: 0, max: 1440 },
    { field: 'met_min_high', type: 'range', min: 0, max: 1440 },
  ];

  return validateData(data, rules);
}

/**
 * Sanitize and clean data
 */
export function sanitizeData<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'date'>
): Partial<T> {
  const sanitized: any = {};

  for (const key in schema) {
    const value = data[key];
    const type = schema[key];

    switch (type) {
      case 'string':
        sanitized[key] = String(value || '').trim();
        break;
      case 'number':
        const num = Number(value);
        sanitized[key] = isNaN(num) ? 0 : num;
        break;
      case 'boolean':
        sanitized[key] = Boolean(value);
        break;
      case 'date':
        if (value && typeof value === 'object' && (value as any) instanceof Date) {
          sanitized[key] = value;
        } else if (typeof value === 'string' || typeof value === 'number') {
          sanitized[key] = new Date(value);
        } else {
          sanitized[key] = new Date();
        }
        break;
    }
  }

  return sanitized;
}

/**
 * Check for missing data gaps
 */
export function detectDataGaps(dates: Date[], maxGapDays = 1): Array<{ start: Date; end: Date; days: number }> {
  if (dates.length < 2) return [];

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const gaps: Array<{ start: Date; end: Date; days: number }> = [];

  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].getTime() - sorted[i - 1].getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > maxGapDays) {
      gaps.push({
        start: sorted[i - 1],
        end: sorted[i],
        days: Math.floor(diffDays),
      });
    }
  }

  return gaps;
}
