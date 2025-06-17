import { LinearGradient, useFont, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { memo, useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Bar, CartesianChart, useChartPressState } from 'victory-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useChartAppearAnimation } from '@/hooks/useChartAppearAnimation';
import type { InteractiveBarChartProps } from './types';

// We'll use require for the font to avoid TypeScript issues with .ttf imports
const SpaceMono = require('../../assets/fonts/SpaceMono-Regular.ttf');

const InteractiveBarChart: React.FC<InteractiveBarChartProps> = ({
    data,
    config = {},
    title,
    description,
    theme = 'light',
    onBarPress,
    selectedIndex,
    showSelectionInfo = true,
    gradientOpacity = 0.3, // Default 30% opacity for gradient end
    showTooltip = true,
    tooltipConfig = {},
    // Chart layout configuration
    padding,
    domainPadding,
    // Grid display configuration
    showGrid = false,
    showXAxis = true,
    showYAxis = true,
    showFrame = false,
    // Appearing animation configuration
    enableAppearAnimation = false,
    appearAnimationType = 'spring',
    appearAnimationDuration = 800,
    appearAnimationStagger = true,
    appearAnimationStaggerDelay = 50,
    onAppearAnimationComplete,
}) => {
    // Responsive dimensions calculation
    const { width: screenWidth } = Dimensions.get('window');

    // Early validation - ensure we have valid data and screen dimensions
    if (!data || !Array.isArray(data) || data.length === 0 || !screenWidth || screenWidth <= 0) {
        return (
            <ThemedView style={{
                margin: 10,
                padding: 12,
                borderRadius: 16,
                backgroundColor: Colors[theme]?.card || '#ffffff',
                alignItems: 'center',
                minWidth: 200,
                alignSelf: 'center',
            }}>
                {title && (
                    <ThemedText type="subtitle" style={{ marginBottom: 2, textAlign: 'center' }}>
                        {title}
                    </ThemedText>
                )}
                {description && (
                    <ThemedText style={{ marginBottom: 10, textAlign: 'center', opacity: 0.7, fontSize: 12 }}>
                        {description}
                    </ThemedText>
                )}
                <ThemedView style={{
                    width: 200,
                    height: 220,
                    backgroundColor: 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ThemedText style={{ opacity: 0.5 }}>No data available</ThemedText>
                </ThemedView>
            </ThemedView>
        );
    }

    // Load font using Skia's useFont hook
    const font = useFont(SpaceMono, 12);

    // Better responsive calculation with grid-based approach
    const responsiveCalculations = () => {
        const baseMargins = 20; // Reduced from 32px - Total horizontal margins (10px each side)
        const cardPadding = 24; // Reduced from 40px - Card internal padding (12px each side)
        const availableWidth = Math.max(200, screenWidth - baseMargins - cardPadding); // Ensure minimum width

        // Calculate optimal spacing for data length with more aggressive space usage
        const dataLength = Math.max(1, data?.length || 1); // Ensure at least 1 to avoid division by zero
        const minBarWidth = 18; // Increased minimum bar width
        const reservedPadding = 80; // Reduced from 120px for chart padding
        const optimalBarWidth = Math.max(minBarWidth, Math.floor((availableWidth - reservedPadding) / dataLength));

        return {
            containerWidth: availableWidth,
            barWidth: optimalBarWidth,
            spacing: Math.max(2, Math.floor((availableWidth - (optimalBarWidth * dataLength)) / (dataLength + 1))), // Reduced min spacing
        };
    };

    const responsiveDims = responsiveCalculations();

    // Set up chart press state for interactions
    const { state, isActive } = useChartPressState({
        x: 0,
        y: { value: 0 }
    });

    // Enhanced tooltip state
    const [tooltipValue, setTooltipValue] = useState('');
    const [previousDataIndex, setPreviousDataIndex] = useState<number | null>(null);
    const [isManuallyActive, setIsManuallyActive] = useState(false);
    const [manualTooltipValue, setManualTooltipValue] = useState('');

    // Enhanced animation values
    const smoothTransition = useSharedValue(0);
    const gestureVelocity = useSharedValue(0);
    const lastGestureTime = useSharedValue(0);
    const lastSelectionUpdateTime = useSharedValue(0);

    // Use the reusable animation hook
    const { animatedData: currentAnimatedData } = useChartAppearAnimation(data, {
        enableAnimation: enableAppearAnimation,
        animationType: appearAnimationType,
        duration: appearAnimationDuration,
        enableStagger: appearAnimationStagger,
        staggerDelay: appearAnimationStaggerDelay,
        onComplete: onAppearAnimationComplete
    });

    // Default tooltip configuration
    const defaultTooltipConfig = {
        currencySymbol: '',
        currencyPosition: 'before' as const,
        backgroundColor: Colors[theme].tint || '#177AD5',
        textColor: '#ffffff',
        borderRadius: 12,
        fontSize: Platform.OS === 'ios' ? 16 : 14,
        fontWeight: '500',
        paddingHorizontal: Platform.OS === 'ios' ? 12 : 10,
        paddingVertical: Platform.OS === 'ios' ? 6 : 5,
        minWidth: Platform.OS === 'ios' ? 50 : 45,
        autoHide: true,
        autoHideDelay: 3000,
        ...tooltipConfig
    };

    // Format thousands to 'k' abbreviation - worklet version
    const formatThousands = (value: number): string => {
        'worklet';
        if (value >= 1000) {
            const thousands = value / 1000;
            const formatted = thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1);
            return `${formatted}k`;
        }
        return value.toFixed(1);
    };

    // Convert opacity (0-1) to hex transparency (00-FF)
    const opacityToHex = (opacity: number): string => {
        const clampedOpacity = Math.max(0, Math.min(1, opacity));
        const hex = Math.round(clampedOpacity * 255).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };

    // Format value for tooltip - WORKLET VERSION
    const formatValue = (value: number): string => {
        'worklet';
        if (defaultTooltipConfig.formatValue) {
            // Note: Custom formatValue function can't be used in worklet context
            // We'll handle this in the JS thread
            return formatThousands(value);
        }

        const formattedValue = formatThousands(value);
        const { currencySymbol, currencyPosition } = defaultTooltipConfig;

        if (!currencySymbol) return formattedValue;

        return currencyPosition === 'before'
            ? `${currencySymbol}${formattedValue}`
            : `${formattedValue}${currencySymbol}`;
    };

    // JS thread format function for custom formatters
    const formatValueJS = (value: number): string => {
        if (defaultTooltipConfig.formatValue) {
            return defaultTooltipConfig.formatValue(value);
        }
        return formatValue(value);
    };

    // Update tooltip value with enhanced haptic feedback
    const updateTooltipValueWithHaptic = (value: string, dataIndex: number) => {
        setTooltipValue(value);
        // Enhanced haptic feedback - only trigger if we moved to a different data point
        if (previousDataIndex !== null && previousDataIndex !== dataIndex && Platform.OS !== 'web') {
            const feedbackStyle = Math.abs(dataIndex - previousDataIndex) > 1
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light;
            Haptics.impactAsync(feedbackStyle);
        }
        setPreviousDataIndex(dataIndex);
    };

    // Manual tooltip activation with auto-hide
    const activateManualTooltip = (value: string) => {
        if (!showTooltip) return;

        setIsManuallyActive(true);
        setManualTooltipValue(value);

        if (defaultTooltipConfig.autoHide) {
            setTimeout(() => {
                setIsManuallyActive(false);
                setManualTooltipValue('');
            }, defaultTooltipConfig.autoHideDelay);
        }
    };

    // Function to update tooltip and selected state from UI thread - WORKLET
    const updateTooltipAndSelection = (xValue: number, yValue: number) => {
        'worklet';

        // Get the closest data point index
        const index = Math.round(xValue);
        const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
        const dataPoint = data[clampedIndex];

        if (dataPoint) {
            // Track gesture velocity for smooth transitions
            const currentTime = Date.now();
            if (lastGestureTime.value > 0) {
                const timeDelta = currentTime - lastGestureTime.value;
                if (timeDelta > 0) {
                    gestureVelocity.value = Math.abs(index - (previousDataIndex || 0)) / timeDelta;
                }
            }
            lastGestureTime.value = currentTime;

            // Update tooltip if enabled
            if (showTooltip) {
                const formattedValue = formatValue(dataPoint.value); // Use actual data value, not yValue
                runOnJS(updateTooltipValueWithHaptic)(formattedValue, clampedIndex);
            }

            // Update selected state during dragging with throttling for performance
            if (onBarPress && clampedIndex !== previousDataIndex) {
                const currentTime = Date.now();
                // Throttle selection updates to every 50ms for smooth performance
                if (currentTime - lastSelectionUpdateTime.value > 50) {
                    lastSelectionUpdateTime.value = currentTime;
                    runOnJS(onBarPress)(dataPoint, clampedIndex);
                }
            }
        }
    };

    // Use animated reaction to track changes and update tooltip and selection
    useAnimatedReaction(
        () => state.x.value,
        () => {
            if (isActive && data.length > 0) {
                const xValue = state.x.value.value;
                const yValue = state.y.value.value.value;
                updateTooltipAndSelection(xValue, yValue);
            }
        }
    );

    // Enhanced gesture state management for instant response
    useEffect(() => {
        if (!isActive) {
            setTooltipValue('');
            setPreviousDataIndex(null);

            // Platform-specific gesture state transitions
            gestureVelocity.value = withSpring(0, { damping: 15, stiffness: 120 });

            // Instant hide for iOS, smooth for Android
            const hideConfig = Platform.OS === 'ios'
                ? { damping: 30, stiffness: 500 }
                : { damping: 12, stiffness: 100 };
            smoothTransition.value = withSpring(0, hideConfig);
        } else {
            // Instant show for iOS, smooth for Android
            const showConfig = Platform.OS === 'ios'
                ? { damping: 30, stiffness: 500 }
                : { damping: 15, stiffness: 150 };
            smoothTransition.value = withSpring(1, showConfig);
        }

        // Note: onBarPress is now called during dragging in updateTooltipAndSelection
        // This ensures real-time selection updates while dragging
    }, [isActive, data, onBarPress, showTooltip]); // Removed state.x.value to prevent Reanimated warning

    // Default configuration with enhanced padding for tooltips
    const defaultConfig = {
        height: 220,
        // Use provided padding or enhanced defaults
        padding: padding || {
            left: Math.max(12, responsiveDims?.spacing || 12),
            right: Math.max(12, responsiveDims?.spacing || 12),
            top: showTooltip ? 50 : 30, // Increased top padding when tooltips are enabled
            bottom: 16
        },
        // Use provided domainPadding or enhanced defaults
        domainPadding: domainPadding || {
            left: Math.max(8, (responsiveDims?.spacing || 12) / 2),
            right: Math.max(8, (responsiveDims?.spacing || 12) / 2),
            top: showTooltip ? 60 : 30, // Increased top domain padding for tooltips
            bottom: 0
        },
        barColor: Colors[theme]?.tint || '#177AD5',
        gradientColors: [
            Colors[theme]?.tint || '#177AD5',
            (Colors[theme]?.tint || '#177AD5') + opacityToHex(gradientOpacity)
        ] as [string, string],
        roundedCorners: {
            topLeft: 4,
            topRight: 4,
        },
        xAxisConfig: {
            font,
            labelColor: showXAxis ? (theme === 'dark' ? '#ccc' : '#666') : 'transparent',
            lineColor: showGrid ? (theme === 'dark' ? '#333' : '#f0f0f0') : 'transparent',
            lineWidth: showGrid ? 1 : 0,
            // Ensure we show all labels
            tickCount: Math.max(1, data?.length || 1),
            formatXLabel: (value: any) => {
                if (typeof value === 'number') {
                    const index = Math.round(value);
                    if (index >= 0 && index < (data?.length || 0)) {
                        return data?.[index]?.label || String(value);
                    }
                }
                return String(value);
            },
        },
        yAxisConfig: showYAxis ? {
            font,
            labelColor: theme === 'dark' ? '#ccc' : '#666',
            lineColor: showGrid ? (theme === 'dark' ? '#333' : '#f0f0f0') : 'transparent',
            lineWidth: showGrid ? 1 : 0,
            tickCount: 6,
            formatYLabel: (value: any) => {
                if (typeof value === 'number') {
                    if (value >= 1000) {
                        return `${(value / 1000).toFixed(0)}k`;
                    }
                    return String(Math.round(value));
                }
                return String(value);
            },
        } : {
            font,
            labelColor: 'transparent',
            lineColor: 'transparent',
            lineWidth: 0,
            tickCount: 6,
            formatYLabel: () => '',
        },
        frameConfig: {
            lineColor: showFrame ? (theme === 'dark' ? '#444' : '#ddd') : 'transparent',
            lineWidth: showFrame ? 1 : 0,
        },
        isAnimated: true,
        animationDuration: 800,
        domain: undefined as { x?: [number, number]; y?: [number, number] } | undefined,
    };

    // Merge default config with provided config
    const mergedConfig = { ...defaultConfig, ...config };

    // Validate and ensure all critical values are defined
    const safeConfig = {
        ...mergedConfig,
        height: Math.max(1, mergedConfig.height || 220),
        padding: mergedConfig.padding || { left: 12, right: 12, top: 30, bottom: 16 },
        domainPadding: mergedConfig.domainPadding || { left: 8, right: 8, top: 30, bottom: 0 },
        gradientColors: mergedConfig.gradientColors || ['#177AD5', '#177AD5'],
        roundedCorners: mergedConfig.roundedCorners || { topLeft: 4, topRight: 4 }
    };

    // Apply gradient opacity to gradient colors if specified
    if (mergedConfig.gradientColors && (gradientOpacity !== 0.3 || config.gradientOpacity !== undefined)) {
        const finalOpacity = config.gradientOpacity !== undefined ? config.gradientOpacity : gradientOpacity;
        const baseColor = mergedConfig.gradientColors[0];
        const secondColor = mergedConfig.gradientColors[1];

        if (secondColor) {
            // Remove existing transparency if present (8-character hex colors have alpha)
            const colorWithoutTransparency = secondColor.length === 9 && secondColor.startsWith('#')
                ? secondColor.substring(0, 7)
                : secondColor;
            mergedConfig.gradientColors[1] = colorWithoutTransparency + opacityToHex(finalOpacity);
        } else {
            // If no second color, use the first color with opacity
            const baseColorWithoutTransparency = baseColor.length === 9 && baseColor.startsWith('#')
                ? baseColor.substring(0, 7)
                : baseColor;
            mergedConfig.gradientColors[1] = baseColorWithoutTransparency + opacityToHex(finalOpacity);
        }
    }

    // Prepare data for Victory Native XL (ensure proper format)
    const formattedData = currentAnimatedData.map((item, index) => ({
        x: index, // Use index as x-value for proper positioning
        value: typeof item?.value === 'number' ? item.value : 0,
        label: item?.label || `Item ${index + 1}`,
        originalIndex: index,
    }));

    const selectedItem = selectedIndex !== null && selectedIndex !== undefined ? data[selectedIndex] : null;

    // Enhanced tooltip animated style with velocity-based animations
    const tooltipAnimatedStyle = useAnimatedStyle(() => {
        const tooltipWidth = defaultTooltipConfig.minWidth;

        // Platform-specific animation timing - iOS instant, Android smooth
        const animationDuration = Platform.OS === 'ios' ? 0 : 150;
        const springConfig = Platform.OS === 'ios'
            ? { damping: 30, stiffness: 500 } // Very fast spring for iOS
            : { damping: 15, stiffness: 150 }; // Smooth spring for Android

        // Velocity-based scale for natural feel
        const velocityScale = interpolate(
            gestureVelocity.value,
            [0, 0.5, 1.5],
            [1, 1.05, 1.1],
            Extrapolate.CLAMP
        );

        // Smooth transition opacity with platform-specific timing
        const transitionOpacity = interpolate(
            smoothTransition.value,
            [0, 0.3, 1],
            [0, 0.7, 1],
            Extrapolate.CLAMP
        );

        return {
            opacity: withTiming(
                ((isActive || isManuallyActive) && showTooltip) ? transitionOpacity : 0,
                { duration: animationDuration }
            ),
            transform: [
                {
                    translateX: state.x.position.value - tooltipWidth / 2,
                },
                {
                    translateY: state.y.value.position.value - 65, // Increased offset for better positioning
                },
                {
                    scale: withSpring(
                        ((isActive || isManuallyActive) && showTooltip) ? velocityScale : 0.8,
                        springConfig
                    ),
                },
            ],
        };
    });

    const styles = StyleSheet.create({
        container: {
            margin: 10, // Reduced from 16px
            padding: 12, // Reduced from 20px
            borderRadius: 16,
            backgroundColor: Colors[theme]?.card || '#ffffff',
            alignItems: 'center',
            // Ensure container takes full available width with minimal margins
            width: Math.max(200, screenWidth - 20), // Reduced from 32px with minimum width
            alignSelf: 'center',
        },
        title: {
            marginBottom: 2, // Reduced from 4px
            textAlign: 'center',
        },
        description: {
            marginBottom: 10, // Reduced from 16px
            textAlign: 'center',
            opacity: 0.7,
            fontSize: 12,
        },
        chartContainer: {
            width: Math.max(200, responsiveDims?.containerWidth || 200),
            height: safeConfig?.height || 220,
            position: 'relative',
            // Ensure proper overflow handling
            overflow: 'visible',
            backgroundColor: 'transparent',
        },
        selectionInfo: {
            marginTop: 8, // Reduced from 12px
            padding: 6, // Reduced from 8px
            borderRadius: 8,
            backgroundColor: Colors[theme]?.surface || '#f5f5f5',
        },
        selectionText: {
            fontSize: 12,
            fontWeight: '500',
        },
        // iOS-specific tooltip - larger size
        iosTooltip: {
            position: 'absolute',
            backgroundColor: Colors[theme]?.tint || '#177AD5',
            paddingHorizontal: 12, // Larger padding for iOS
            paddingVertical: 6, // Larger padding for iOS
            borderRadius: 15, // border-radius: 15px from web
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 50,
            zIndex: 1000,
        },
        iosTooltipText: {
            color: '#ffffff',
            fontSize: 16, // Larger font for iOS
            fontWeight: '400',
            textAlign: 'center',
        },
        // Android tooltip - original size
        tooltip: {
            position: 'absolute',
            backgroundColor: Colors[theme]?.tint || '#177AD5',
            paddingHorizontal: 9, // Original Android size
            paddingVertical: 3, // Original Android size
            borderRadius: 15, // border-radius: 15px from web
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 40,
            zIndex: 1000,
        },
        tooltipText: {
            color: '#ffffff',
            fontSize: 14, // Original Android size
            fontWeight: '400',
            textAlign: 'center',
        },
    });

    return (
        <ThemedView style={styles.container}>
            {title && (
                <ThemedText type="subtitle" style={styles.title}>
                    {title}
                </ThemedText>
            )}

            {description && (
                <ThemedText style={styles.description}>
                    {description}
                </ThemedText>
            )}

            <ThemedView style={[styles.chartContainer, { backgroundColor: 'transparent' }]}>
                <Animated.View style={{ width: '100%', height: '100%' }}>
                    <CartesianChart
                        data={formattedData}
                        xKey="x"
                        yKeys={["value"]}
                        padding={{
                            left: Math.max(0, typeof safeConfig.padding === 'object' ? (safeConfig.padding?.left || 12) : (safeConfig.padding || 12)),
                            right: Math.max(0, typeof safeConfig.padding === 'object' ? (safeConfig.padding?.right || 12) : (safeConfig.padding || 12)),
                            top: Math.max(0, typeof safeConfig.padding === 'object' ? (safeConfig.padding?.top || 30) : (safeConfig.padding || 30)),
                            bottom: Math.max(0, typeof safeConfig.padding === 'object' ? (safeConfig.padding?.bottom || 16) : (safeConfig.padding || 16))
                        }}
                        domainPadding={{
                            left: Math.max(0, typeof safeConfig.domainPadding === 'object' ? (safeConfig.domainPadding?.left || 8) : (safeConfig.domainPadding || 8)),
                            right: Math.max(0, typeof safeConfig.domainPadding === 'object' ? (safeConfig.domainPadding?.right || 8) : (safeConfig.domainPadding || 8)),
                            top: Math.max(0, typeof safeConfig.domainPadding === 'object' ? (safeConfig.domainPadding?.top || 30) : (safeConfig.domainPadding || 30)),
                            bottom: Math.max(0, typeof safeConfig.domainPadding === 'object' ? (safeConfig.domainPadding?.bottom || 0) : (safeConfig.domainPadding || 0))
                        }}
                        domain={{
                            x: [0, Math.max(1, data.length - 1)],
                            y: [0, Math.max(1, Math.max(...data.map(d => d.value || 0)) * 1.1)]
                        }}
                        xAxis={showXAxis ? safeConfig.xAxisConfig : undefined}
                        yAxis={showYAxis ? [safeConfig.yAxisConfig] : undefined}
                        chartPressState={state}
                        frame={showFrame ? safeConfig.frameConfig : undefined}
                    >
                        {({ points, chartBounds }) => {
                            // Validate chartBounds to prevent undefined values
                            const safeChartBounds = {
                                left: Math.max(0, chartBounds?.left || 0),
                                right: Math.max(0, chartBounds?.right || 200),
                                top: Math.max(0, chartBounds?.top || 0),
                                bottom: Math.max(0, chartBounds?.bottom || 220)
                            };

                            // Ensure points.value exists and is valid
                            if (!points?.value || !Array.isArray(points.value)) {
                                return null;
                            }

                            return (
                                <Bar
                                    points={points.value}
                                    chartBounds={safeChartBounds}
                                    roundedCorners={safeConfig.roundedCorners}
                                >
                                    <LinearGradient
                                        start={vec(0, 0)}
                                        end={vec(0, Math.max(1, safeConfig.height || 220))}
                                        colors={safeConfig.gradientColors}
                                    />
                                </Bar>
                            );
                        }}
                    </CartesianChart>
                </Animated.View>

                {/* Enhanced Tooltip with platform-specific styling */}
                {showTooltip && ((isActive && tooltipValue) || (isManuallyActive && manualTooltipValue)) && (
                    <Animated.View style={[
                        Platform.OS === 'ios' ? styles.iosTooltip : styles.tooltip,
                        tooltipAnimatedStyle,
                        {
                            backgroundColor: defaultTooltipConfig.backgroundColor,
                            borderRadius: defaultTooltipConfig.borderRadius,
                            paddingHorizontal: defaultTooltipConfig.paddingHorizontal,
                            paddingVertical: defaultTooltipConfig.paddingVertical,
                            minWidth: defaultTooltipConfig.minWidth,
                        }
                    ]}>
                        <Text style={[
                            Platform.OS === 'ios' ? styles.iosTooltipText : styles.tooltipText,
                            {
                                color: defaultTooltipConfig.textColor,
                                fontSize: defaultTooltipConfig.fontSize,
                                fontWeight: defaultTooltipConfig.fontWeight as any,
                            }
                        ]}>
                            {isActive ? tooltipValue : manualTooltipValue}
                        </Text>
                    </Animated.View>
                )}
            </ThemedView>

            {showSelectionInfo && selectedItem && (
                <ThemedView style={styles.selectionInfo}>
                    <ThemedText style={styles.selectionText}>
                        Selected: {selectedItem.label || `Bar ${(selectedIndex || 0) + 1}`} - {selectedItem.value}
                    </ThemedText>
                </ThemedView>
            )}
        </ThemedView>
    );
};

export default memo(InteractiveBarChart); 