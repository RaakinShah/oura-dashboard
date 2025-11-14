export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  phone: (value: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  creditCard: (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '');
    const cardRegex = /^[0-9]{13,19}$/;
    if (!cardRegex.test(cleaned)) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  },

  zipCode: (value: string, country: string = 'US'): boolean => {
    const patterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
      CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    };
    return patterns[country]?.test(value) || false;
  },

  ssn: (value: string): boolean => {
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    return ssnRegex.test(value);
  },

  strongPassword: (value: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    return (
      value.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  },

  alphanumeric: (value: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(value);
  },

  alpha: (value: string): boolean => {
    return /^[a-zA-Z]+$/.test(value);
  },

  numeric: (value: string): boolean => {
    return /^\d+$/.test(value);
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  range: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },

  match: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
  },

  equals: (value: any, compare: any): boolean => {
    return value === compare;
  },

  date: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  beforeDate: (value: string, beforeDate: string): boolean => {
    return new Date(value) < new Date(beforeDate);
  },

  afterDate: (value: string, afterDate: string): boolean => {
    return new Date(value) > new Date(afterDate);
  },
};

export type Validator = keyof typeof validators;
