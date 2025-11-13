/**
 * Accessible form utilities
 */

export interface FormFieldError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'custom';
}

/**
 * Generate accessible error ID for form field
 */
export function getErrorId(fieldId: string): string {
  return `${fieldId}-error`;
}

/**
 * Generate accessible description ID for form field
 */
export function getDescriptionId(fieldId: string): string {
  return `${fieldId}-description`;
}

/**
 * Create ARIA attributes for form field
 */
export function getFormFieldAriaAttributes(config: {
  fieldId: string;
  hasError?: boolean;
  errorMessage?: string;
  description?: string;
  required?: boolean;
}): Record<string, any> {
  const attributes: Record<string, any> = {};

  if (config.required) {
    attributes['aria-required'] = 'true';
  }

  if (config.hasError) {
    attributes['aria-invalid'] = 'true';
    attributes['aria-describedby'] = getErrorId(config.fieldId);
  } else if (config.description) {
    attributes['aria-describedby'] = getDescriptionId(config.fieldId);
  }

  return attributes;
}

/**
 * Announce form errors to screen readers
 */
export function announceFormErrors(errors: FormFieldError[]): void {
  const errorCount = errors.length;
  const message =
    errorCount === 1
      ? 'There is 1 error in the form. Please correct it before submitting.'
      : `There are ${errorCount} errors in the form. Please correct them before submitting.`;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus first error field in form
 */
export function focusFirstError(formId: string): boolean {
  const form = document.getElementById(formId);
  if (!form) return false;

  const firstError = form.querySelector('[aria-invalid="true"]') as HTMLElement;
  if (firstError) {
    firstError.focus();
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  return false;
}

/**
 * Validate form field with accessible error handling
 */
export function validateField(
  value: any,
  rules: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean;
  }
): { valid: boolean; message?: string } {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return { valid: false, message: 'This field is required' };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, message: 'Please enter a valid format' };
  }

  if (rules.min !== undefined && value < rules.min) {
    return { valid: false, message: `Value must be at least ${rules.min}` };
  }

  if (rules.max !== undefined && value > rules.max) {
    return { valid: false, message: `Value must be at most ${rules.max}` };
  }

  if (rules.minLength !== undefined && value.length < rules.minLength) {
    return { valid: false, message: `Must be at least ${rules.minLength} characters` };
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    return { valid: false, message: `Must be at most ${rules.maxLength} characters` };
  }

  if (rules.custom && !rules.custom(value)) {
    return { valid: false, message: 'Invalid value' };
  }

  return { valid: true };
}

/**
 * Create accessible label for input with indicator
 */
export function createAccessibleLabel(
  label: string,
  required: boolean = false,
  optional: boolean = false
): string {
  if (required) {
    return `${label} (required)`;
  }
  if (optional) {
    return `${label} (optional)`;
  }
  return label;
}

/**
 * Get input type for better mobile keyboard
 */
export function getOptimalInputType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    email: 'email',
    phone: 'tel',
    number: 'number',
    url: 'url',
    date: 'date',
    time: 'time',
    search: 'search',
  };

  return typeMap[fieldType] || 'text';
}

/**
 * Get autocomplete attribute for common fields
 */
export function getAutocomplete(fieldName: string): string {
  const autocompleteMap: Record<string, string> = {
    name: 'name',
    'first-name': 'given-name',
    'last-name': 'family-name',
    email: 'email',
    phone: 'tel',
    address: 'street-address',
    city: 'address-level2',
    state: 'address-level1',
    zip: 'postal-code',
    country: 'country',
    'credit-card': 'cc-number',
    cvv: 'cc-csc',
    'expiry-date': 'cc-exp',
  };

  return autocompleteMap[fieldName] || 'off';
}
