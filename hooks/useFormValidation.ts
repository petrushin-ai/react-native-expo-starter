import { useCallback, useEffect, useState } from 'react';

export interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

export interface FieldConfig {
    initialValue?: string;
    rules?: ValidationRule[];
}

export interface FormConfig {
    [fieldName: string]: FieldConfig;
}

export interface FieldState {
    value: string;
    error: string;
    touched: boolean;
    isValid: boolean;
}

export interface FormState {
    [fieldName: string]: FieldState;
}

// Common validation rules that can be reused
export const validationRules = {
    required: (message = 'This field is required'): ValidationRule => ({
        validate: (value: string) => value.trim().length > 0,
        message,
    }),
    minLength: (length: number, message?: string): ValidationRule => ({
        validate: (value: string) => value.length >= length,
        message: message || `Must be at least ${length} characters`,
    }),
    maxLength: (length: number, message?: string): ValidationRule => ({
        validate: (value: string) => value.length <= length,
        message: message || `Must be no more than ${length} characters`,
    }),
    pattern: (regex: RegExp, message: string): ValidationRule => ({
        validate: (value: string) => regex.test(value),
        message,
    }),
    email: (message = 'Invalid email address'): ValidationRule => ({
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message,
    }),
};

export function useFormValidation(config: FormConfig) {
    // Initialize form state
    const [formState, setFormState] = useState<FormState>(() => {
        const initialState: FormState = {};
        Object.keys(config).forEach(fieldName => {
            initialState[fieldName] = {
                value: config[fieldName].initialValue || '',
                error: '',
                touched: false,
                isValid: false,
            };
        });
        return initialState;
    });

    // Validate a single field
    const validateField = useCallback((fieldName: string, value: string): string => {
        const fieldConfig = config[fieldName];
        if (!fieldConfig || !fieldConfig.rules) return '';

        for (const rule of fieldConfig.rules) {
            if (!rule.validate(value)) {
                return rule.message;
            }
        }
        return '';
    }, [config]);

    // Update field value and validate
    const setFieldValue = useCallback((fieldName: string, value: string) => {
        setFormState(prev => {
            const error = validateField(fieldName, value);
            return {
                ...prev,
                [fieldName]: {
                    ...prev[fieldName],
                    value,
                    error,
                    isValid: !error,
                },
            };
        });
    }, [validateField]);

    // Mark field as touched
    const setFieldTouched = useCallback((fieldName: string, touched = true) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                touched,
            },
        }));
    }, []);

    // Check if entire form is valid
    const isFormValid = Object.keys(config).every(
        fieldName => formState[fieldName].isValid
    );

    // Get field props for easy integration with inputs
    const getFieldProps = useCallback((fieldName: string) => ({
        value: formState[fieldName].value,
        onChangeText: (value: string) => setFieldValue(fieldName, value),
        onBlur: () => setFieldTouched(fieldName, true),
    }), [formState, setFieldValue, setFieldTouched]);

    // Get error for a field (only show if touched)
    const getFieldError = useCallback((fieldName: string): string => {
        const field = formState[fieldName];
        return field.touched ? field.error : '';
    }, [formState]);

    // Validate all fields and mark as touched
    const validateForm = useCallback(() => {
        Object.keys(config).forEach(fieldName => {
            const value = formState[fieldName].value;
            const error = validateField(fieldName, value);
            setFormState(prev => ({
                ...prev,
                [fieldName]: {
                    ...prev[fieldName],
                    error,
                    touched: true,
                    isValid: !error,
                },
            }));
        });
    }, [config, formState, validateField]);

    // Reset form to initial state
    const resetForm = useCallback(() => {
        const initialState: FormState = {};
        Object.keys(config).forEach(fieldName => {
            initialState[fieldName] = {
                value: config[fieldName].initialValue || '',
                error: '',
                touched: false,
                isValid: false,
            };
        });
        setFormState(initialState);
    }, [config]);

    // Validate fields on mount
    useEffect(() => {
        Object.keys(config).forEach(fieldName => {
            const value = formState[fieldName].value;
            const error = validateField(fieldName, value);
            setFormState(prev => ({
                ...prev,
                [fieldName]: {
                    ...prev[fieldName],
                    error,
                    isValid: !error,
                },
            }));
        });
    }, []);

    return {
        formState,
        isFormValid,
        getFieldProps,
        getFieldError,
        setFieldValue,
        setFieldTouched,
        validateForm,
        resetForm,
    };
} 