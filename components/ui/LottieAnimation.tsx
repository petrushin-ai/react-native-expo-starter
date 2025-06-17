import { useColorScheme } from '@/hooks/useColorScheme';
import {
    getComprehensiveAndroidProps,
    getPlatformLottieSource,
    isAndroid,
    logAndroidLottieDebug,
    roundDimensionsForAndroid
} from '@/utils/lottieUtils';
import LottieView, { AnimationObject, LottieViewProps } from 'lottie-react-native';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';

type LottieSize = 'small' | 'medium' | 'large';
type LottieAnimationName = 'spinner' | 'splash';

export interface LottieAnimationProps extends Omit<LottieViewProps, 'style' | 'source'> {
    /**
     * Name of the animation (will automatically select platform-appropriate format)
     */
    animationName?: LottieAnimationName;
    /**
     * Direct source override (use animationName instead for platform optimization)
     */
    source?: any;
    /**
     * Size preset for the animation
     */
    size?: LottieSize;
    /**
     * Custom width for the animation (overrides size preset)
     */
    width?: number;
    /**
     * Custom height for the animation (overrides size preset)
     */
    height?: number;
    /**
     * Whether to adapt colors for theme (if animation supports dynamic colors)
     */
    adaptToTheme?: boolean;
    /**
     * Background color for the animation container
     */
    backgroundColor?: string;
    /**
     * Custom style for the animation container
     */
    style?: ViewStyle;
    /**
     * Whether to apply Android-specific optimizations (default: true)
     */
    androidOptimized?: boolean;
    /**
     * Whether to enable safe mode on Android (wraps rendering in try-catch)
     */
    enableSafeMode?: boolean;
    /**
     * Whether to show debug information when animation fails to load
     */
    showDebugInfo?: boolean;
}

// Re-export LottieView for ref usage
export { LottieView };

/**
 * Gets the theme-safe color scheme with fallback
 */
const getColorScheme = (): 'light' | 'dark' => {
    try {
        // Try to use the hook first
        const hookScheme = useColorScheme();
        return (hookScheme as any)?.colorScheme || hookScheme || 'light';
    } catch {
        // Fallback to Appearance API if hook fails
        return Appearance.getColorScheme() || 'light';
    }
};

/**
 * Size presets for Lottie animations
 */
const SIZE_PRESETS: Record<LottieSize, { width: number; height: number }> = {
    small: { width: 50, height: 50 },
    medium: { width: 100, height: 100 },
    large: { width: 200, height: 200 },
};

/**
 * Rounds dimensions to whole numbers for Android compatibility
 * Android has issues with non-whole number dimensions
 */
const roundDimensions = (width: number, height: number) => {
    return roundDimensionsForAndroid(width, height);
};

/**
 * Checks if system animations are enabled on Android
 */
const useSystemAnimationsEnabled = () => {
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        if (Platform.OS === 'android') {
            // On Android, we can't directly check if system animations are disabled
            // But we can detect if animations don't start after a timeout
            const timer = setTimeout(() => {
                // This is a heuristic - if we're still here, animations might be disabled
                console.warn('Lottie: System animations might be disabled on this Android device');
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    return enabled;
};

/**
 * Debug component to show animation loading issues
 */
const LottieDebugInfo: React.FC<{ source: any; animationName?: string; style?: ViewStyle }> = ({
    source,
    animationName,
    style
}) => {
    const colorScheme = getColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[style, styles.debugContainer, isDark && styles.debugContainerDark]}>
            <Text style={[styles.debugText, isDark && styles.debugTextDark]}>
                Lottie Debug Info:
            </Text>
            <Text style={[styles.debugText, isDark && styles.debugTextDark]}>
                Platform: {Platform.OS}
            </Text>
            <Text style={[styles.debugText, isDark && styles.debugTextDark]}>
                Animation: {animationName || 'Custom'}
            </Text>
            <Text style={[styles.debugText, isDark && styles.debugTextDark]}>
                Source type: {typeof source}
            </Text>
            <Text style={[styles.debugText, isDark && styles.debugTextDark]}>
                Has source: {source ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.debugText, isDark && styles.debugTextDark]}>
                Format: {isAndroid() ? 'JSON (Android)' : 'dotLottie (iOS)'}
            </Text>
        </View>
    );
};

export const LottieAnimation = forwardRef<LottieView, LottieAnimationProps>(
    (
        {
            animationName,
            source: customSource,
            size = 'medium',
            width,
            height,
            adaptToTheme = false,
            backgroundColor,
            style,
            androidOptimized = true,
            enableSafeMode = true,
            showDebugInfo = false,
            ...props
        },
        ref
    ) => {
        const colorScheme = getColorScheme();
        const isDark = colorScheme === 'dark';
        const systemAnimationsEnabled = useSystemAnimationsEnabled();
        const [hasError, setHasError] = useState(false);

        // Get the appropriate source based on platform and animation name
        const source = useMemo(() => {
            if (customSource) {
                return customSource;
            }
            if (animationName) {
                try {
                    return getPlatformLottieSource(animationName);
                } catch (error) {
                    console.error(`Failed to load animation ${animationName}:`, error);
                    logAndroidLottieDebug(animationName, error);
                    setHasError(true);
                    return null;
                }
            }
            console.warn('LottieAnimation: No animationName or source provided');
            return null;
        }, [customSource, animationName]);

        // Calculate dimensions
        const dimensions = useMemo(() => {
            const baseWidth = width ?? SIZE_PRESETS[size].width;
            const baseHeight = height ?? SIZE_PRESETS[size].height;
            return roundDimensions(baseWidth, baseHeight);
        }, [size, width, height]);

        // Get comprehensive Android-specific props
        const androidProps = useMemo(() => {
            if (!androidOptimized) return {};
            return getComprehensiveAndroidProps(enableSafeMode);
        }, [androidOptimized, enableSafeMode]);

        // Build final style
        const finalStyle = useMemo(() => {
            const baseStyle: ViewStyle = {
                width: dimensions.width,
                height: dimensions.height,
                backgroundColor: backgroundColor || 'transparent',
            };

            return StyleSheet.flatten([baseStyle, style]);
        }, [dimensions, backgroundColor, style]);

        // Handle animation errors
        const handleAnimationFailure = (error?: any) => {
            console.warn('Lottie animation failed to load:', error);
            logAndroidLottieDebug(source, error);
            setHasError(true);
        };

        // Show debug info if requested or if there's an error
        if ((showDebugInfo || hasError) && (isAndroid() || showDebugInfo)) {
            return (
                <LottieDebugInfo
                    source={source}
                    animationName={animationName}
                    style={finalStyle}
                />
            );
        }

        // Don't render if no source
        if (!source) {
            return (
                <View style={finalStyle}>
                    <Text style={styles.errorText}>No animation source</Text>
                </View>
            );
        }

        return (
            <LottieView
                ref={ref}
                source={source}
                style={finalStyle}
                onAnimationFailure={handleAnimationFailure}
                // Apply Android optimizations
                {...androidProps}
                // Ensure proper defaults
                autoPlay={props.autoPlay ?? true}
                loop={props.loop ?? true}
                // Pass through all other props
                {...props}
            />
        );
    }
);

LottieAnimation.displayName = 'LottieAnimation';

const styles = StyleSheet.create({
    debugContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 16,
    },
    debugContainerDark: {
        backgroundColor: '#333',
        borderColor: '#666',
    },
    debugText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },
    debugTextDark: {
        color: '#ccc',
    },
    errorText: {
        fontSize: 12,
        color: '#ff0000',
        textAlign: 'center',
    },
});

// Export commonly used types for convenience
export type { AnimationObject, LottieViewProps };

