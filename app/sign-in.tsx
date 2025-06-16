import { Button } from '@/components/ui/Button';
import ExpandableView from '@/components/ui/ExpandableView';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useSession } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { Redirect, router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignIn() {
    const { signIn, session, isAuthEnabled } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errorModal, setErrorModal] = useState({
        visible: false,
        title: '',
        message: '',
    });
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Separate form validation instances for login and signup
    const loginForm = useFormValidation({
        username: {
            initialValue: '',
            rules: [
                validationRules.required('Username is required'),
                validationRules.minLength(3, 'Username must be at least 3 characters'),
                validationRules.pattern(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
            ],
        },
        password: {
            initialValue: '',
            rules: [
                validationRules.required('Password is required'),
            ],
        },
    });

    const signupForm = useFormValidation({
        username: {
            initialValue: '',
            rules: [
                validationRules.required('Username is required'),
                validationRules.minLength(3, 'Username must be at least 3 characters'),
                validationRules.pattern(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
            ],
        },
        password: {
            initialValue: '',
            rules: [
                validationRules.required('Password is required'),
                validationRules.minLength(6, 'Password must be at least 6 characters'),
            ],
        },
        confirmPassword: {
            initialValue: '',
            rules: [
                validationRules.required('Please confirm your password'),
            ],
        },
    });

    // Get the current active form
    const currentForm = activeTab === 'login' ? loginForm : signupForm;

    // Additional validation for confirm password in signup mode
    const isConfirmPasswordValid = useMemo(() => {
        if (activeTab === 'login') return true;

        const password = signupForm.formState.password?.value || '';
        const confirmPassword = signupForm.formState.confirmPassword?.value || '';

        if (!password || !confirmPassword) return confirmPassword === '';
        return password === confirmPassword;
    }, [activeTab, signupForm.formState.password?.value, signupForm.formState.confirmPassword?.value]);

    // Enhanced form validation that includes confirm password check
    const isFormValidEnhanced = useMemo(() => {
        if (activeTab === 'login') {
            return loginForm.isFormValid;
        } else {
            return signupForm.isFormValid && isConfirmPasswordValid;
        }
    }, [activeTab, loginForm.isFormValid, signupForm.isFormValid, isConfirmPasswordValid]);

    // Get confirm password error for signup
    const getConfirmPasswordError = useCallback(() => {
        if (activeTab === 'login') return '';

        const confirmPasswordField = signupForm.formState.confirmPassword;
        if (!confirmPasswordField?.touched) return '';

        const confirmPasswordValue = confirmPasswordField.value || '';
        if (!confirmPasswordValue) return 'Please confirm your password';

        if (!isConfirmPasswordValid) return 'Passwords do not match';

        return '';
    }, [activeTab, signupForm.formState.confirmPassword?.touched, signupForm.formState.confirmPassword?.value, isConfirmPasswordValid]);

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
        currentForm.validateForm();

        if (!isFormValidEnhanced) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await signIn(
                currentForm.formState.username?.value || '',
                currentForm.formState.password?.value || ''
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
            <StatusBar
                barStyle="light-content"
                backgroundColor={isDark ? '#1E40AF' : '#3B82F6'}
            />
            <KeyboardAvoidingView
                style={[styles.container, isDark && styles.containerDark]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>
                                {activeTab === 'login' ? 'Go ahead and complete\nyour account and setup' : 'Sign up now to access\nyour personal account'}
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {activeTab === 'login'
                                    ? 'Create your account and simplify your workflow instantly.'
                                    : 'Sign up to access your account and exclusive features.'
                                }
                            </Text>
                        </View>

                        <View style={[styles.card, isDark && styles.cardDark]}>
                            {/* Segmented Control */}
                            <View style={[styles.segmentedControl, isDark && styles.segmentedControlDark]}>
                                <TouchableOpacity
                                    style={[
                                        styles.segmentButton,
                                        activeTab === 'login' && styles.segmentButtonActive,
                                        activeTab === 'login' && isDark && styles.segmentButtonActiveDark,
                                    ]}
                                    onPress={() => setActiveTab('login')}
                                >
                                    <Text style={[
                                        styles.segmentText,
                                        activeTab === 'login' && styles.segmentTextActive,
                                        isDark && styles.segmentTextDark,
                                        activeTab === 'login' && isDark && styles.segmentTextActiveDark,
                                    ]}>
                                        Login
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.segmentButton,
                                        activeTab === 'signup' && styles.segmentButtonActive,
                                        activeTab === 'signup' && isDark && styles.segmentButtonActiveDark,
                                    ]}
                                    onPress={() => setActiveTab('signup')}
                                >
                                    <Text style={[
                                        styles.segmentText,
                                        activeTab === 'signup' && styles.segmentTextActive,
                                        isDark && styles.segmentTextDark,
                                        activeTab === 'signup' && isDark && styles.segmentTextActiveDark,
                                    ]}>
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                <Input
                                    {...currentForm.getFieldProps('username')}
                                    label="Username"
                                    placeholder="Enter your username"
                                    keyboardType="default"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    error={currentForm.getFieldError('username')}
                                    touched={currentForm.formState.username?.touched || false}
                                    variant="default"
                                />

                                <View style={styles.passwordContainer}>
                                    <Input
                                        {...currentForm.getFieldProps('password')}
                                        label="Password"
                                        placeholder="Enter your password"
                                        secureTextEntry={!showPassword}
                                        editable={!isLoading}
                                        error={currentForm.getFieldError('password')}
                                        touched={currentForm.formState.password?.touched || false}
                                        variant="default"
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text style={[styles.passwordToggleText, isDark && styles.passwordToggleTextDark]}>
                                            {showPassword ? '🙈' : '👁️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Animated Confirm Password Field */}
                                <ExpandableView expanded={activeTab === 'signup'}>
                                    <Input
                                        {...signupForm.getFieldProps('confirmPassword')}
                                        label="Confirm Password"
                                        placeholder="Confirm your password"
                                        secureTextEntry={!showPassword}
                                        editable={!isLoading}
                                        error={getConfirmPasswordError()}
                                        touched={signupForm.formState.confirmPassword?.touched || false}
                                        variant="default"
                                    />
                                </ExpandableView>

                                {/* Animated Login Options */}
                                <ExpandableView expanded={activeTab === 'login'}>
                                    <View style={styles.loginOptions}>
                                        <TouchableOpacity
                                            style={styles.rememberMeContainer}
                                            onPress={() => setRememberMe(!rememberMe)}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                rememberMe && styles.checkboxChecked,
                                                isDark && styles.checkboxDark,
                                                rememberMe && isDark && styles.checkboxCheckedDark,
                                            ]}>
                                                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                            <Text style={[styles.rememberMeText, isDark && styles.rememberMeTextDark]}>
                                                Remember Me
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity>
                                            <Text style={[styles.forgotPassword, isDark && styles.forgotPasswordDark]}>
                                                Forgot Password?
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </ExpandableView>

                                <Button
                                    title={activeTab === 'login' ? 'Login' : 'Register'}
                                    onPress={handleSignIn}
                                    disabled={!isFormValidEnhanced || isLoading}
                                    loading={isLoading}
                                    style={styles.primaryButton}
                                />

                                {/* Animated Social Login Section */}
                                <ExpandableView expanded={activeTab === 'login'}>
                                    <View>
                                        <Text style={[styles.orText, isDark && styles.orTextDark]}>
                                            Or login with
                                        </Text>

                                        <View style={styles.socialButtons}>
                                            <TouchableOpacity style={[styles.socialButton, isDark && styles.socialButtonDark]}>
                                                <Text style={styles.socialIcon}>G</Text>
                                                <Text style={[styles.socialText, isDark && styles.socialTextDark]}>
                                                    Google
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={[styles.socialButton, isDark && styles.socialButtonDark]}>
                                                <Text style={[styles.socialIcon, styles.facebookIcon]}>f</Text>
                                                <Text style={[styles.socialText, isDark && styles.socialTextDark]}>
                                                    Facebook
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ExpandableView>
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
        backgroundColor: '#3B82F6', // Blue background
    },
    containerDark: {
        backgroundColor: '#1E40AF', // Darker blue for dark mode
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center', // Center content vertically
        paddingHorizontal: 24,
        paddingVertical: 40,
        minHeight: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.5,
        lineHeight: 34,
        textAlign: 'left',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#BFDBFE',
        letterSpacing: -0.2,
        lineHeight: 24,
        textAlign: 'left',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    cardDark: {
        backgroundColor: '#1F2937',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 32,
    },
    segmentedControlDark: {
        backgroundColor: '#374151',
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    segmentButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    segmentButtonActiveDark: {
        backgroundColor: '#111827',
    },
    segmentText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        letterSpacing: -0.2,
    },
    segmentTextDark: {
        color: '#9CA3AF',
    },
    segmentTextActive: {
        color: '#111827',
        fontWeight: '600',
    },
    segmentTextActiveDark: {
        color: '#F9FAFB',
    },
    form: {
        gap: 4,
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordToggle: {
        position: 'absolute',
        right: 16,
        top: 38,
        padding: 8,
    },
    passwordToggleText: {
        fontSize: 16,
    },
    passwordToggleTextDark: {
        opacity: 0.8,
    },
    loginOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxDark: {
        borderColor: '#6B7280',
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    checkboxCheckedDark: {
        backgroundColor: '#60A5FA',
        borderColor: '#60A5FA',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    rememberMeText: {
        fontSize: 14,
        color: '#6B7280',
        letterSpacing: -0.1,
    },
    rememberMeTextDark: {
        color: '#9CA3AF',
    },
    forgotPassword: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
        letterSpacing: -0.1,
    },
    forgotPasswordDark: {
        color: '#60A5FA',
    },
    primaryButton: {
        marginTop: 16,
    },
    orText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 14,
        marginVertical: 24,
        letterSpacing: -0.1,
    },
    orTextDark: {
        color: '#6B7280',
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    socialButtonDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    socialIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
        color: '#DB4437', // Google red
    },
    facebookIcon: {
        color: '#4267B2', // Facebook blue
    },
    socialText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        letterSpacing: -0.1,
    },
    socialTextDark: {
        color: '#D1D5DB',
    },
}); 