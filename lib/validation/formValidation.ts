import { useState, useCallback } from 'react';
import { SchemaValidator, ValidationError } from './schema';

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface UseFormValidationOptions {
  validator: SchemaValidator;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  options: UseFormValidationOptions
) {
  const { validator, validateOnChange = false, validateOnBlur = true } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const result = validator.validate(values);
    const newErrors: FormErrors = {};
    
    result.errors.forEach((error: ValidationError) => {
      newErrors[error.field] = error.message;
    });
    
    setErrors(newErrors);
    return result.isValid;
  }, [validator, values]);

  const validateField = useCallback(
    (field: string) => {
      const fieldErrors = validator.validateField(field, values[field]);
      
      if (fieldErrors.length > 0) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[0].message }));
        return false;
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      }
    },
    [validator, values]
  );

  const handleChange = useCallback(
    (field: string, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      
      if (validateOnChange && touched[field]) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, touched, validateField]
  );

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);
      
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      const isValid = validateForm();

      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [values, validateForm]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    validateField,
    reset,
    setValues,
    setErrors,
  };
}
