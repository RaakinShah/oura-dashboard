/**
 * Validation Utilities
 * Functions for validating various data types
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Phone number validation
 */
export function validatePhone(phone: string, country: string = 'US'): ValidationResult {
  const cleaned = phone.replace(/\D/g, '');

  const patterns: Record<string, { length: number; regex?: RegExp }> = {
    US: { length: 10 },
    UK: { length: 10 },
    CA: { length: 10 },
  };

  const pattern = patterns[country] || patterns.US;

  if (!cleaned) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (cleaned.length !== pattern.length) {
    return { valid: false, error: `Phone number must be ${pattern.length} digits` };
  }

  return { valid: true };
}

/**
 * URL validation
 */
export function validateURL(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Password strength validation
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecial?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true,
  } = options;

  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain a special character' };
  }

  return { valid: true };
}

/**
 * Credit card validation (Luhn algorithm)
 */
export function validateCreditCard(cardNumber: string): ValidationResult {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Card number must contain only digits' };
  }

  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, error: 'Invalid card number length' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { valid: false, error: 'Invalid card number' };
  }

  return { valid: true };
}

/**
 * Date validation
 */
export function validateDate(date: string, format: 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'YYYY-MM-DD'): ValidationResult {
  const patterns = {
    'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
    'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
  };

  if (!patterns[format].test(date)) {
    return { valid: false, error: `Date must be in ${format} format` };
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  return { valid: true };
}

/**
 * Number range validation
 */
export function validateRange(
  value: number,
  min?: number,
  max?: number
): ValidationResult {
  if (min !== undefined && value < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && value > max) {
    return { valid: false, error: `Value must be at most ${max}` };
  }

  return { valid: true };
}

/**
 * String length validation
 */
export function validateLength(
  text: string,
  min?: number,
  max?: number
): ValidationResult {
  if (min !== undefined && text.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` };
  }

  if (max !== undefined && text.length > max) {
    return { valid: false, error: `Must be at most ${max} characters` };
  }

  return { valid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: any, fieldName?: string): ValidationResult {
  const isEmpty = value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  if (isEmpty) {
    const field = fieldName || 'This field';
    return { valid: false, error: `${field} is required` };
  }

  return { valid: true };
}

/**
 * Pattern validation (regex)
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  errorMessage?: string
): ValidationResult {
  if (!pattern.test(value)) {
    return { valid: false, error: errorMessage || 'Invalid format' };
  }

  return { valid: true };
}

/**
 * Custom validation
 */
export function validateCustom(
  value: any,
  validator: (value: any) => boolean,
  errorMessage: string
): ValidationResult {
  if (!validator(value)) {
    return { valid: false, error: errorMessage };
  }

  return { valid: true };
}

/**
 * Form validation helper
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ((value: any) => ValidationResult)[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];

    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        errors[field] = result.error!;
        break;
      }
    }
  }

  return errors;
}

/**
 * Sanitize HTML
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate JSON
 */
export function validateJSON(json: string): ValidationResult {
  try {
    JSON.parse(json);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validate age
 */
export function validateAge(birthDate: Date, minAge?: number, maxAge?: number): ValidationResult {
  const today = new Date();
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (minAge !== undefined && age < minAge) {
    return { valid: false, error: `Must be at least ${minAge} years old` };
  }

  if (maxAge !== undefined && age > maxAge) {
    return { valid: false, error: `Must be at most ${maxAge} years old` };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInMB: number): ValidationResult {
  const maxSize = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSize) {
    return { valid: false, error: `File size must not exceed ${maxSizeInMB}MB` };
  }

  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): ValidationResult {
  const fileType = file.type;
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  const isTypeAllowed = allowedTypes.some(type => {
    if (type.includes('*')) {
      const baseType = type.split('/')[0];
      return fileType.startsWith(baseType);
    }
    return fileType === type || fileExtension === type.replace('.', '');
  });

  if (!isTypeAllowed) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
}
