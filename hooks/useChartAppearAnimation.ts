import { useEffect, useState } from 'react';
import {
    runOnJS,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export interface ChartAnimationConfig {
    enableAnimation: boolean;
    animationType: 'timing' | 'spring';
    duration: number;
    enableStagger: boolean;
    staggerDelay: number;
    onComplete?: () => void;
}

export interface ChartDataItem {
    value: number;
    label: string;
    [key: string]: any;
}

export function useChartAppearAnimation<T extends ChartDataItem>(
    data: T[],
    config: ChartAnimationConfig
) {
    const {
        enableAnimation,
        animationType,
        duration,
        enableStagger,
        staggerDelay,
        onComplete
    } = config;

    // Animation state
    const appearProgress = useSharedValue(enableAnimation ? 0 : 1);
    const hasTriggeredCallback = useSharedValue(false);
    const [currentAnimatedData, setCurrentAnimatedData] = useState<T[]>(data || []);

    // Create animation configuration
    const createAnimationConfig = () => {
        return animationType === 'spring'
            ? withSpring(1, {
                damping: 20, // Increased damping for stronger ease-out
                stiffness: 60, // Further reduced stiffness for slower, smoother motion
                mass: 1.5 // Increased mass for more pronounced ease-out
            })
            : withTiming(1, {
                duration,
                easing: require('react-native-reanimated').Easing.bezier(0.16, 1, 0.3, 1) // Enhanced ease-out curve
            });
    };

    // Trigger appearing animation on mount
    useEffect(() => {
        if (enableAnimation && data && data.length > 0) {
            hasTriggeredCallback.value = false;
            appearProgress.value = createAnimationConfig();
        }
    }, [enableAnimation, animationType, duration]);

    // Restart animation when data changes
    useEffect(() => {
        if (!data || data.length === 0) {
            setCurrentAnimatedData([]);
            return;
        }

        if (enableAnimation) {
            appearProgress.value = 0;
            hasTriggeredCallback.value = false;
            appearProgress.value = createAnimationConfig();
        } else {
            // If animation is disabled, update data immediately
            setCurrentAnimatedData(data);
        }
    }, [data, enableAnimation, animationType, duration]);

    // Update animated data when progress changes
    useDerivedValue(() => {
        if (!data || data.length === 0) {
            runOnJS(setCurrentAnimatedData)([]);
            return;
        }

        if (!enableAnimation) {
            runOnJS(setCurrentAnimatedData)(data);
            return;
        }

        const newData = data.map((item, index) => {
            if (!item || typeof item.value !== 'number') {
                return { ...item, value: 0 };
            }

            let progress = appearProgress.value;

            // Apply stagger effect if enabled
            if (enableStagger && data.length > 1) {
                // Use a different approach that doesn't cause division by zero
                const staggerDelayTime = index * staggerDelay;
                const totalAnimationTime = duration + (data.length - 1) * staggerDelay;
                const normalizedStaggerDelay = staggerDelayTime / totalAnimationTime;

                // Calculate effective progress with safe denominator
                const adjustedProgress = Math.max(0, appearProgress.value - normalizedStaggerDelay);
                const maxProgressRange = 1 - normalizedStaggerDelay;

                // Ensure we don't divide by zero and handle edge cases
                if (maxProgressRange > 0.001) {
                    progress = Math.min(1, Math.max(0, adjustedProgress / maxProgressRange));
                } else {
                    // For the last items where the range is very small, use direct progress
                    progress = Math.max(0, Math.min(1, appearProgress.value));
                }
            }

            return {
                ...item,
                value: item.value * progress
            } as T;
        });

        runOnJS(setCurrentAnimatedData)(newData);
    });

    // Track animation completion and trigger callback
    useDerivedValue(() => {
        if (enableAnimation &&
            appearProgress.value >= 1 &&
            !hasTriggeredCallback.value &&
            onComplete) {
            hasTriggeredCallback.value = true;
            runOnJS(onComplete)();
        }
        return null;
    });

    return {
        animatedData: currentAnimatedData,
        isAnimating: enableAnimation && appearProgress.value < 1,
        progress: appearProgress.value
    };
} 