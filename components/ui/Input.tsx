import { useColorScheme } from '@/hooks/useColorScheme';
import React, { forwardRef } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';

export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    touched?: boolean;
    containerStyle?: ViewStyle;
    variant?: 'default' | 'filled';
}

export const Input = forwardRef<TextInput, InputProps>(
    ({ label, error, touched, containerStyle, variant = 'default', style, ...props }, ref) => {
        const colorScheme = useColorScheme();
        const isDark = colorScheme === 'dark';
        const showError = touched && error;

        const inputStyles = [
            styles.input,
            isDark && styles.inputDark,
            variant === 'filled' && styles.inputFilled,
            variant === 'filled' && isDark && styles.inputFilledDark,
            showError && styles.inputError,
            showError && isDark && styles.inputErrorDark,
            style,
        ];

        return (
            <View style={[styles.container, containerStyle]}>
                {label && (
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        {label}
                    </Text>
                )}
                <TextInput
                    ref={ref}
                    style={inputStyles}
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    {...props}
                />
                <View style={styles.errorContainer}>
                    {showError && (
                        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                            {error}
                        </Text>
                    )}
                </View>
            </View>
        );
    }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
        letterSpacing: -0.1,
    },
    labelDark: {
        color: '#D1D5DB',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        letterSpacing: -0.2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        color: '#F9FAFB',
    },
    inputFilled: {
        backgroundColor: '#F9FAFB',
        borderColor: 'transparent',
    },
    inputFilledDark: {
        backgroundColor: '#374151',
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#DC2626',
        shadowColor: '#DC2626',
        shadowOpacity: 0.1,
    },
    inputErrorDark: {
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    errorContainer: {
        height: 20,
        justifyContent: 'center',
        paddingHorizontal: 4,
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
        letterSpacing: -0.1,
    },
    errorTextDark: {
        color: '#F87171',
    },
}); 