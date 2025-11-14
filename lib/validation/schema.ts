import { validators } from './validators';

export interface ValidationRule {
  validator: keyof typeof validators | ((value: any) => boolean);
  message: string;
  args?: any[];
}

export interface Schema {
  [key: string]: ValidationRule[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class SchemaValidator {
  private schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];

    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field];

      for (const rule of rules) {
        let isValid = false;

        if (typeof rule.validator === 'function') {
          isValid = rule.validator(value);
        } else if (typeof rule.validator === 'string') {
          const validatorFn = validators[rule.validator];
          if (validatorFn) {
            isValid = rule.args
              ? (validatorFn as any)(value, ...rule.args)
              : (validatorFn as any)(value);
          }
        }

        if (!isValid) {
          errors.push({ field, message: rule.message });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateField(field: string, value: any): ValidationError[] {
    const rules = this.schema[field];
    if (!rules) return [];

    const errors: ValidationError[] = [];

    for (const rule of rules) {
      let isValid = false;

      if (typeof rule.validator === 'function') {
        isValid = rule.validator(value);
      } else if (typeof rule.validator === 'string') {
        const validatorFn = validators[rule.validator];
        if (validatorFn) {
          isValid = rule.args
            ? (validatorFn as any)(value, ...rule.args)
            : (validatorFn as any)(value);
        }
      }

      if (!isValid) {
        errors.push({ field, message: rule.message });
      }
    }

    return errors;
  }
}

export function createSchema(schema: Schema): SchemaValidator {
  return new SchemaValidator(schema);
}
