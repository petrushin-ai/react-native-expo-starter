import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isDisabled = disabled || loading;

    // Animation for button state transitions
    const animatedOpacity = useRef(new Animated.Value(isDisabled ? 0.6 : 1)).current;
    const animatedScale = useRef(new Animated.Value(1)).current;

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
                    },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? '#FFFFFF' : isDark ? '#F9FAFB' : '#3B82F6'}
                        size="small"
                    />
                ) : (
                    <Text style={[variantStyles.text, sizeStyles.text]}>
                        {title}
                    </Text>
                )}
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
        color: '#94A3B8',
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
        color: '#94A3B8',
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
        color: '#94A3B8',
    },
}); 