import { useColorScheme } from '@/hooks/useColorScheme';
import LottieView, { AnimationObject, LottieViewProps } from 'lottie-react-native';
import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

type LottieSize = 'small' | 'medium' | 'large';

export interface LottieAnimationProps extends Omit<LottieViewProps, 'style'> {
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
    themeAware?: boolean;
    /**
     * Custom style object
     */
    style?: ViewStyle;
    /**
     * Background color for the animation container
     */
    backgroundColor?: string;
}

const SIZE_PRESETS: Record<LottieSize, { width: number; height: number }> = {
    small: { width: 60, height: 60 },
    medium: { width: 120, height: 120 },
    large: { width: 200, height: 200 },
};

export const LottieAnimation = forwardRef<LottieView, LottieAnimationProps>(
    (
        {
            size = 'medium',
            width,
            height,
            themeAware = false,
            style,
            backgroundColor,
            colorFilters,
            ...props
        },
        ref
    ) => {
        const colorScheme = useColorScheme();
        const isDark = colorScheme === 'dark';

        const dimensions = useMemo(() => {
            if (width !== undefined || height !== undefined) {
                return {
                    width: width || SIZE_PRESETS[size].width,
                    height: height || SIZE_PRESETS[size].height,
                };
            }
            return SIZE_PRESETS[size];
        }, [size, width, height]);

        const themedColorFilters = useMemo(() => {
            if (!themeAware) {
                return colorFilters;
            }

            // Basic theme-aware color filtering
            // This would need to be customized based on the specific animation
            const baseFilters = colorFilters || [];

            if (isDark) {
                // Example: make certain elements lighter in dark mode
                return [
                    ...baseFilters,
                    // Add any theme-specific color filters here
                    // { keypath: "Shape Layer 1", color: "#FFFFFF" }
                ];
            }

            return baseFilters;
        }, [themeAware, isDark, colorFilters]);

        const containerStyle = useMemo(() => {
            return [
                styles.container,
                {
                    width: dimensions.width,
                    height: dimensions.height,
                    backgroundColor: backgroundColor || 'transparent',
                },
                style,
            ];
        }, [dimensions, backgroundColor, style]);

        return (
            <LottieView
                ref={ref}
                style={containerStyle}
                colorFilters={themedColorFilters}
                {...props}
            />
        );
    }
);

LottieAnimation.displayName = 'LottieAnimation';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// Export commonly used types for convenience
export { LottieView };
export type { AnimationObject, LottieViewProps };

