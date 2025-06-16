import { Modal } from '@/components/ui/Modal';
import { useSession } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function SignIn() {
    const { signIn, session, isAuthEnabled } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({
        visible: false,
        title: '',
        message: '',
    });
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Form validation configuration
    const form = useFormValidation({
        username: {
            rules: [
                validationRules.required('Username is required'),
                // Add more rules here in the future, e.g.:
                // validationRules.minLength(3, 'Username must be at least 3 characters'),
                // validationRules.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
            ],
        },
        password: {
            rules: [
                validationRules.required('Password is required'),
                // Add more rules here in the future, e.g.:
                // validationRules.minLength(8, 'Password must be at least 8 characters'),
                // validationRules.pattern(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter'),
            ],
        },
    });

    // If already authenticated or auth is disabled, redirect to protected area
    if (session || !isAuthEnabled) {
        return <Redirect href="/(protected)" />;
    }

    const showError = (title: string, message: string) => {
        setErrorModal({
            visible: true,
            title,
            message,
        });
    };

    const hideError = () => {
        setErrorModal({
            visible: false,
            title: '',
            message: '',
        });
    };

    const handleSignIn = async () => {
        // Validate all fields first
        form.validateForm();

        if (!form.isFormValid) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await signIn(
                form.formState.username.value,
                form.formState.password.value
            );
            if (success) {
                // Navigate to protected area after successful sign in
                router.replace('/(protected)');
            } else {
                showError(
                    'Authentication Failed',
                    'The username or password you entered is incorrect. Please try again.'
                );
            }
        } catch (error) {
            showError(
                'Sign In Error',
                'An unexpected error occurred while signing in. Please try again later.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <KeyboardAvoidingView
                style={[styles.container, isDark && styles.containerDark]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, isDark && styles.textDark]}>Sign In</Text>

                    <View style={styles.form}>
                        <View style={styles.fieldContainer}>
                            <TextInput
                                {...form.getFieldProps('username')}
                                style={[
                                    styles.input,
                                    isDark && styles.inputDark,
                                    form.getFieldError('username') && styles.inputError
                                ]}
                                placeholder="Username"
                                placeholderTextColor={isDark ? '#999' : '#666'}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                            <View style={styles.errorContainer}>
                                {form.getFieldError('username') ? (
                                    <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                                        {form.getFieldError('username')}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <TextInput
                                {...form.getFieldProps('password')}
                                style={[
                                    styles.input,
                                    isDark && styles.inputDark,
                                    form.getFieldError('password') && styles.inputError
                                ]}
                                placeholder="Password"
                                placeholderTextColor={isDark ? '#999' : '#666'}
                                secureTextEntry
                                editable={!isLoading}
                            />
                            <View style={styles.errorContainer}>
                                {form.getFieldError('password') ? (
                                    <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                                        {form.getFieldError('password')}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (!form.isFormValid || isLoading) && styles.buttonDisabled
                            ]}
                            onPress={handleSignIn}
                            disabled={!form.isFormValid || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.hint, isDark && styles.textDark]}>
                        Use the credentials configured in your environment
                    </Text>
                </View>
            </KeyboardAvoidingView>

            <Modal
                visible={errorModal.visible}
                onClose={hideError}
                title={errorModal.title}
                message={errorModal.message}
                type="error"
                primaryButtonText="Try Again"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    textDark: {
        color: '#fff',
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    fieldContainer: {
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    inputDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
        color: '#fff',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorContainer: {
        height: 20,
        justifyContent: 'center',
        paddingHorizontal: 4,
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#FF3B30',
    },
    errorTextDark: {
        color: '#FF6B6B',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        backgroundColor: '#999',
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    hint: {
        marginTop: 20,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
}); 