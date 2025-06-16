import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';

// Import LottieAnimation component for the loading spinner
import { LottieAnimation } from './LottieAnimation';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    variant = 'primary',
    size = 'medium',
    loading,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isDisabled = disabled || loading;

    // Check if this button supports loading (loading prop was explicitly passed)
    const supportsLoading = loading !== undefined;

    // Animation for button state transitions
    const animatedOpacity = useRef(new Animated.Value(isDisabled ? 0.6 : 1)).current;
    const animatedScale = useRef(new Animated.Value(1)).current;

    // Helper functions - defined before useMemo
    const getSizePadding = () => {
        switch (size) {
            case 'small':
                return { horizontal: 12, vertical: 8 };
            case 'large':
                return { horizontal: 20, vertical: 16 };
            default: // medium
                return { horizontal: 16, vertical: 14 };
        }
    };

    const getSizeFontSize = () => {
        switch (size) {
            case 'small':
                return 14;
            case 'large':
                return 18;
            default: // medium
                return 16;
        }
    };

    const getSpinnerSize = () => {
        switch (size) {
            case 'small':
                return { width: 22, height: 22 };
            case 'large':
                return { width: 26, height: 26 };
            default: // medium
                return { width: 24, height: 24 };
        }
    };

    // Calculate minimum width to prevent layout shifts
    const minimumDimensions = useMemo(() => {
        const spinnerSize = getSpinnerSize();
        const padding = getSizePadding();
        const spinnerWithMargin = spinnerSize.width + 8; // 8px margin

        // Estimate text width (rough calculation)
        const fontSize = getSizeFontSize();
        const estimatedTextWidth = title.length * fontSize * 0.6; // Rough character width

        // Minimum width includes: padding + text + spinner + margin
        const minWidth = padding.horizontal * 2 + estimatedTextWidth + spinnerWithMargin;

        return {
            minWidth: Math.max(minWidth, 80), // Minimum 80px width
            minHeight: padding.vertical * 2 + fontSize + 4, // Consistent height
        };
    }, [title, size]);

    useEffect(() => {
        Animated.timing(animatedOpacity, {
            toValue: isDisabled ? 0.6 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isDisabled, animatedOpacity]);

    const handlePressIn = () => {
        if (!isDisabled) {
            Animated.spring(animatedScale, {
                toValue: 0.96,
                useNativeDriver: true,
                tension: 300,
                friction: 10,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (!isDisabled) {
            Animated.spring(animatedScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 300,
                friction: 10,
            }).start();
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    container: [
                        styles.container,
                        styles.secondaryContainer,
                        isDark && styles.secondaryContainerDark,
                        isDisabled && styles.secondaryContainerDisabled,
                        isDisabled && isDark && styles.secondaryContainerDisabledDark,
                    ],
                    text: [
                        styles.text,
                        styles.secondaryText,
                        isDark && styles.secondaryTextDark,
                        isDisabled && styles.secondaryTextDisabled,
                    ],
                };
            case 'outline':
                return {
                    container: [
                        styles.container,
                        styles.outlineContainer,
                        isDark && styles.outlineContainerDark,
                        isDisabled && styles.outlineContainerDisabled,
                        isDisabled && isDark && styles.outlineContainerDisabledDark,
                    ],
                    text: [
                        styles.text,
                        styles.outlineText,
                        isDark && styles.outlineTextDark,
                        isDisabled && styles.outlineTextDisabled,
                    ],
                };
            case 'ghost':
                return {
                    container: [
                        styles.container,
                        styles.ghostContainer,
                        isDisabled && styles.ghostContainerDisabled,
                    ],
                    text: [
                        styles.text,
                        styles.ghostText,
                        isDark && styles.ghostTextDark,
                        isDisabled && styles.ghostTextDisabled,
                    ],
                };
            default: // primary
                return {
                    container: [
                        styles.container,
                        styles.primaryContainer,
                        isDark && styles.primaryContainerDark,
                        isDisabled && styles.primaryContainerDisabled,
                        isDisabled && isDark && styles.primaryContainerDisabledDark,
                    ],
                    text: [
                        styles.text,
                        styles.primaryText,
                        isDisabled && styles.primaryTextDisabled,
                    ],
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    container: styles.smallContainer,
                    text: styles.smallText,
                };
            case 'large':
                return {
                    container: styles.largeContainer,
                    text: styles.largeText,
                };
            default: // medium
                return {
                    container: styles.mediumContainer,
                    text: styles.mediumText,
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    const getSpinnerColor = () => {
        // Match the exact text color for each variant and state
        if (isDisabled) {
            // All disabled states use the same gray
            return '#64748B';
        }

        switch (variant) {
            case 'primary':
                return '#FFFFFF'; // White text on primary buttons
            case 'secondary':
                return isDark ? '#CBD5E1' : '#334155'; // Match secondary text colors
            case 'outline':
                return isDark ? '#60A5FA' : '#3B82F6'; // Match outline text colors
            case 'ghost':
                return isDark ? '#60A5FA' : '#3B82F6'; // Match ghost text colors
            default:
                return '#FFFFFF';
        }
    };

    return (
        <TouchableOpacity
            disabled={isDisabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            {...props}
        >
            <Animated.View
                style={[
                    variantStyles.container,
                    sizeStyles.container,
                    {
                        opacity: animatedOpacity,
                        transform: [{ scale: animatedScale }],
                        minWidth: minimumDimensions.minWidth,
                        minHeight: minimumDimensions.minHeight,
                    },
                    style,
                ]}
            >
                <View style={styles.contentContainer}>
                    <Text style={[
                        variantStyles.text,
                        sizeStyles.text,
                        // Add left padding only for buttons that support loading AND are not currently loading
                        // This centers the text when no spinner is shown
                        supportsLoading && !loading && { paddingLeft: 32 } // Same as spinner container width
                    ]}>
                        {title}
                    </Text>
                    <View style={[
                        styles.spinnerContainer,
                        // Hide spinner container for buttons that don't support loading
                        !supportsLoading && { width: 0, marginLeft: 0 }
                    ]}>
                        {loading && (
                            <LottieAnimation
                                source={require('@/assets/lottie/spinner.lottie')}
                                width={getSpinnerSize().width}
                                height={getSpinnerSize().height}
                                autoPlay={true}
                                loop={true}
                                colorFilters={[
                                    { keypath: "**", color: getSpinnerColor() }
                                ]}
                            />
                        )}
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 20, // Ensure consistent height
    },
    spinnerContainer: {
        width: 32, // Fixed width to reserve space (24px spinner + 8px margin)
        height: 26, // Fixed height for largest spinner
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    // Sizes
    smallContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    smallText: {
        fontSize: 14,
    },
    mediumContainer: {
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    mediumText: {
        fontSize: 16,
    },
    largeContainer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    largeText: {
        fontSize: 18,
    },
    // Primary variant
    primaryContainer: {
        backgroundColor: '#3B82F6',
    },
    primaryContainerDark: {
        backgroundColor: '#60A5FA',
    },
    primaryContainerDisabled: {
        backgroundColor: '#CBD5E1',
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryContainerDisabledDark: {
        backgroundColor: '#475569',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    primaryTextDisabled: {
        color: '#64748B',
    },
    // Secondary variant
    secondaryContainer: {
        backgroundColor: '#F1F5F9',
        shadowOpacity: 0,
        elevation: 0,
    },
    secondaryContainerDark: {
        backgroundColor: '#334155',
    },
    secondaryContainerDisabled: {
        backgroundColor: '#E2E8F0',
    },
    secondaryContainerDisabledDark: {
        backgroundColor: '#475569',
    },
    secondaryText: {
        color: '#334155',
    },
    secondaryTextDark: {
        color: '#CBD5E1',
    },
    secondaryTextDisabled: {
        color: '#475569',
    },
    // Outline variant
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#3B82F6',
        shadowOpacity: 0,
        elevation: 0,
    },
    outlineContainerDark: {
        borderColor: '#60A5FA',
    },
    outlineContainerDisabled: {
        borderColor: '#CBD5E1',
    },
    outlineContainerDisabledDark: {
        borderColor: '#475569',
    },
    outlineText: {
        color: '#3B82F6',
    },
    outlineTextDark: {
        color: '#60A5FA',
    },
    outlineTextDisabled: {
        color: '#64748B',
    },
    // Ghost variant
    ghostContainer: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    ghostContainerDisabled: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: '#3B82F6',
    },
    ghostTextDark: {
        color: '#60A5FA',
    },
    ghostTextDisabled: {
        color: '#64748B',
    },
}); 