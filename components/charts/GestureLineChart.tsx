import { Circle, LinearGradient, useFont, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Area, CartesianChart, Line, useChartPressState } from 'victory-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useChartAppearAnimation } from '@/hooks/useChartAppearAnimation';
import type { GestureLineChartProps } from './types';

// We'll use require for the font to avoid TypeScript issues with .ttf imports
const SpaceMono = require('../../assets/fonts/SpaceMono-Regular.ttf');

const GestureLineChart: React.FC<GestureLineChartProps> = ({
    data,
    config = {},
    title,
    description,
    theme = 'light',
    onDataPointPress,
    showDataPointsToggle = true,
    initialShowDataPoints = true,
    showTooltip = true,
    interpolationType,
    showStaticDataPoints,
    dataPointSize,
    showDataPointTooltip = false,
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
    // Load font using Skia's useFont hook
    const font = useFont(SpaceMono, 12);

    // Chart press state for gestures
    const { state, isActive } = useChartPressState({
        x: 0,
        y: { y: 0 }
    });

    // State management
    const [showDataPoints, setShowDataPoints] = useState(showStaticDataPoints ?? initialShowDataPoints);
    const [tooltipValue, setTooltipValue] = useState('');
    const [isManuallyActive, setIsManuallyActive] = useState(false);
    const [manualTooltipValue, setManualTooltipValue] = useState('');
    const [previousDataIndex, setPreviousDataIndex] = useState<number | null>(null);
    const [staticTooltipPositions, setStaticTooltipPositions] = useState<Array<{ x: number, y: number, value: number }>>([]);

    // Chart container ref for measuring
    const chartContainerRef = useRef<View>(null);
    const [chartDimensions, setChartDimensions] = useState({ width: 300, height: 220 });
    const chartPointsRef = useRef<any>(null);

    // Responsive dimensions calculation
    const { width: screenWidth } = Dimensions.get('window');

    // Better responsive calculation with grid-based approach
    const responsiveCalculations = () => {
        const baseMargins = 20; // Total horizontal margins (10px each side)
        const cardPadding = 24; // Card internal padding (12px each side)
        const availableWidth = screenWidth - baseMargins - cardPadding;

        return {
            containerWidth: availableWidth,
        };
    };

    const responsiveDims = responsiveCalculations();

    // Fixed height following Victory Native XL best practices
    const chartHeight = config.height || 220;

    // Enhanced gesture state for smooth UX
    const gestureVelocity = useSharedValue(0);
    const gestureActive = useSharedValue(false);
    const lastGestureTime = useSharedValue(0);
    const smoothTransition = useSharedValue(0);
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

    // Default configuration with Victory Native XL settings
    const defaultConfig = {
        height: chartHeight,
        curved: config.curved !== false, // Default to true
        areaChart: config.areaChart !== false, // Default to true
        color1: config.color1 || (theme === 'dark' ? '#4FC3F7' : '#2196F3'),
        thickness: config.thickness || 3,
        // Use provided padding or defaults
        padding: padding || {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        },
        // Use provided domainPadding or defaults
        domainPadding: domainPadding || {
            left: 20,
            right: 20,
            top: 20,
            bottom: 1
        },
        // Area chart styling
        startFillColor: config.startFillColor || (theme === 'dark' ? '#4FC3F7' : '#2196F3'),
        endFillColor: config.endFillColor || (theme === 'dark' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(33, 150, 243, 0.1)'),
        startOpacity: config.startOpacity || 0.8,
        endOpacity: config.endOpacity || 0.3,
        // Axes styling
        yAxisColor: config.yAxisColor || (theme === 'dark' ? '#444' : '#ddd'),
        xAxisColor: config.xAxisColor || (theme === 'dark' ? '#444' : '#ddd'),
        // Animation settings
        isAnimated: config.isAnimated !== false,
        animationDuration: config.animationDuration || 1000,
    };

    // Helper function to determine curve type based on interpolation
    const getCurveType = () => {
        // Priority: 1. Direct prop, 2. Config prop, 3. Legacy curved boolean, 4. Default
        if (interpolationType) {
            return interpolationType;
        }

        if (config.interpolationType) {
            return config.interpolationType;
        }

        // Legacy support for curved prop
        if (config.curved !== undefined) {
            return config.curved ? 'monotoneX' : 'linear';
        }

        // Default
        return 'monotoneX';
    };

    const curveType = getCurveType();

    // Helper function to determine data point size
    const getDataPointSize = (): number => {
        // Priority: 1. Direct prop, 2. Config prop, 3. Default
        if (dataPointSize !== undefined) {
            return dataPointSize;
        }

        if (config.dataPointSize !== undefined) {
            return config.dataPointSize;
        }

        // Legacy support for dataPointsRadius prop
        if (config.dataPointsRadius !== undefined) {
            return config.dataPointsRadius;
        }

        // Default
        return 4;
    };

    const pointSize = getDataPointSize();

    // Update static tooltip positions when data or settings change
    useEffect(() => {
        if (showDataPoints && showDataPointTooltip && chartPointsRef.current) {
            const positions = chartPointsRef.current
                .filter((point: any): point is { x: number; y: number; xValue: number; yValue: number } =>
                    typeof point.x === 'number' && typeof point.y === 'number'
                )
                .map((point: any, index: number) => ({
                    x: point.x,
                    y: point.y,
                    value: data[index]?.value || 0 // Use original data for tooltip values
                }));
            setStaticTooltipPositions(positions);
        } else {
            setStaticTooltipPositions([]);
        }
    }, [showDataPoints, showDataPointTooltip, data, currentAnimatedData]); // Include currentAnimatedData to update positions during animation

    // Default tooltip configuration
    const defaultTooltipConfig = {
        currencySymbol: '',
        currencyPosition: 'before' as const,
        backgroundColor: defaultConfig.color1, // Use the line color for consistency
        textColor: '#ffffff',
        borderRadius: 15,
        fontSize: Platform.OS === 'ios' ? 16 : 14,
        fontWeight: '400',
        paddingHorizontal: Platform.OS === 'ios' ? 12 : 9,
        paddingVertical: Platform.OS === 'ios' ? 6 : 3,
        minWidth: Platform.OS === 'ios' ? 50 : 40,
        autoHide: true,
        autoHideDelay: 3000,
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

    const formatValue = (value: number) => {
        'worklet';
        return formatThousands(value);
    };

    // Non-worklet version for Y-axis labels
    const formatValueForAxis = (value: number) => {
        const formatThousandsJS = (val: number): string => {
            if (val >= 1000) {
                const thousands = val / 1000;
                const formatted = thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1);
                return `${formatted}k`;
            }
            return val.toFixed(1);
        };
        return formatThousandsJS(value);
    };

    // JS thread functions for updating state
    const updateTooltipValue = (value: string) => {
        setTooltipValue(value);
    };

    const updateTooltipValueWithHaptic = (value: string, dataIndex: number) => {
        setTooltipValue(value);
        // Only trigger haptic if we moved to a different data point
        if (previousDataIndex !== null && previousDataIndex !== dataIndex && Platform.OS !== 'web') {
            const feedbackStyle = Math.abs(dataIndex - previousDataIndex) > 1
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light;
            Haptics.impactAsync(feedbackStyle);
        }
        setPreviousDataIndex(dataIndex);
    };

    const activateManualTooltip = (value: string) => {
        setIsManuallyActive(true);
        setManualTooltipValue(value);
        // Auto-hide after 3 seconds
        setTimeout(() => {
            setIsManuallyActive(false);
            setManualTooltipValue('');
        }, 3000);
    };

    // Function to update tooltip from UI thread with enhanced gesture tracking
    const updateTooltip = (xValue: number, yValue: number) => {
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

            const formattedValue = formatValue(dataPoint.value); // Use actual data value (not animated)
            runOnJS(updateTooltipValueWithHaptic)(formattedValue, clampedIndex);

            // Call the provided callback if available
            if (onDataPointPress) {
                runOnJS(onDataPointPress)(dataPoint, clampedIndex);
            }
        }
    };

    // Use derived value to track changes and update tooltip
    useDerivedValue(() => {
        if (isActive && data.length > 0) {
            const xValue = state.x.value.value;
            const yValue = state.y.y.value.value;
            updateTooltip(xValue, yValue);
        }
        return null;
    });

    // Enhanced gesture state management for instant response
    useEffect(() => {
        if (!isActive) {
            setTooltipValue('');
            setPreviousDataIndex(null);

            // Platform-specific gesture state transitions
            gestureActive.value = false;
            gestureVelocity.value = withSpring(0, { damping: 15, stiffness: 120 });

            // Instant hide for iOS, smooth for Android
            const hideConfig = Platform.OS === 'ios'
                ? { damping: 30, stiffness: 500 }
                : { damping: 12, stiffness: 100 };
            smoothTransition.value = withSpring(0, hideConfig);
        } else {
            gestureActive.value = true;

            // Instant show for iOS, smooth for Android
            const showConfig = Platform.OS === 'ios'
                ? { damping: 30, stiffness: 500 }
                : { damping: 15, stiffness: 150 };
            smoothTransition.value = withSpring(1, showConfig);
        }
    }, [isActive]);

    // Enhanced tooltip styles with platform-specific animations for instant iOS response
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
                (isActive || isManuallyActive) ? transitionOpacity : 0,
                { duration: animationDuration }
            ),
            transform: [
                {
                    translateX: state.x.position.value - tooltipWidth / 2,
                },
                {
                    translateY: state.y.y.position.value - 40, // Proper offset for tooltip positioning
                },
                {
                    scale: withSpring(
                        (isActive || isManuallyActive) ? velocityScale : 0.8,
                        springConfig
                    ),
                },
            ],
        };
    });

    const handleToggleDataPoints = () => {
        setShowDataPoints(!showDataPoints);
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
    };

    // Measure chart container on layout
    const onChartLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setChartDimensions({ width, height });
    };

    const styles = StyleSheet.create({
        container: {
            margin: 10, // Reduced from 16px
            padding: 12, // Reduced from 20px
            borderRadius: 16,
            backgroundColor: Colors[theme].card,
            alignItems: 'center',
            // Ensure container takes full available width with minimal margins
            width: screenWidth - 20, // Reduced from 32px
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
        toggleButton: {
            marginBottom: 16,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: Colors[theme].surface,
        },
        toggleButtonText: {
            fontSize: 12,
            fontWeight: '500',
        },
        chartContainer: {
            width: responsiveDims.containerWidth,
            height: chartHeight,
            position: 'relative',
            // Ensure proper overflow handling
            overflow: 'visible',
            backgroundColor: 'transparent',
        },
        // iOS-specific tooltip - larger size
        iosTooltip: {
            position: 'absolute',
            backgroundColor: Colors[theme].tint || '#177AD5',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 50,
            zIndex: 1000,
        },
        iosTooltipText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '400',
            textAlign: 'center',
        },
        // Android tooltip - original size
        tooltip: {
            position: 'absolute',
            backgroundColor: Colors[theme].tint || '#177AD5',
            paddingHorizontal: 9,
            paddingVertical: 3,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 40,
            zIndex: 1000,
        },
        tooltipText: {
            color: '#ffffff',
            fontSize: 14,
            fontWeight: '400',
            textAlign: 'center',
        },
    });

    // Early returns after all hooks
    if (!font) {
        return (
            <ThemedView style={styles.container}>
                <ThemedView style={[styles.chartContainer, { height: chartHeight }]}>
                    <ThemedText>Loading chart...</ThemedText>
                </ThemedView>
            </ThemedView>
        );
    }

    if (!data || data.length === 0) return null;

    // Transform data for Victory Native XL - following official docs pattern
    const chartData = currentAnimatedData.map((item, index) => ({
        x: index,
        y: item.value,
        label: item.label
    }));

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

            {showDataPointsToggle && (
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={handleToggleDataPoints}
                >
                    <ThemedText style={styles.toggleButtonText}>
                        {showDataPoints ? 'Hide' : 'Show'} Data Points
                    </ThemedText>
                </TouchableOpacity>
            )}

            <View
                ref={chartContainerRef}
                style={styles.chartContainer}
                onLayout={onChartLayout}
            >
                <CartesianChart
                    data={chartData}
                    xKey="x"
                    yKeys={["y"]}
                    chartPressState={state}
                    padding={defaultConfig.padding}
                    domainPadding={defaultConfig.domainPadding}
                    axisOptions={{
                        font,
                        formatXLabel: (value) => {
                            const index = Math.round(value);
                            const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
                            return data[clampedIndex]?.label || '';
                        },
                        tickCount: data.length,
                        labelColor: showXAxis ? (theme === 'dark' ? '#ccc' : '#666') : 'transparent',
                        lineColor: showGrid ? (theme === 'dark' ? '#333' : '#f0f0f0') : 'transparent',
                        lineWidth: showGrid ? 1 : 0,
                    }}
                    yAxis={showYAxis ? [{
                        font,
                        lineColor: showGrid ? (theme === 'dark' ? '#333' : '#f0f0f0') : 'transparent',
                        lineWidth: showGrid ? 1 : 0,
                        labelColor: theme === 'dark' ? '#ccc' : '#666',
                        formatYLabel: (value) => formatValueForAxis(value),
                    }] : []}
                    frame={{
                        lineColor: showFrame ? (theme === 'dark' ? '#444' : '#ddd') : 'transparent',
                        lineWidth: showFrame ? 1 : 0,
                    }}
                >
                    {({ points, chartBounds }) => {
                        // Store chart points for static tooltips
                        chartPointsRef.current = points.y;

                        return (
                            <>
                                {/* Enhanced Gradient Area fill */}
                                {defaultConfig.areaChart && (
                                    <Area
                                        points={points.y}
                                        y0={chartBounds.bottom}
                                        curveType={curveType}
                                        animate={{ type: "timing", duration: defaultConfig.animationDuration }}
                                        connectMissingData={true}
                                    >
                                        <LinearGradient
                                            start={vec(0, chartBounds.top)}
                                            end={vec(0, chartBounds.bottom)}
                                            colors={[
                                                defaultConfig.startFillColor + Math.round(defaultConfig.startOpacity * 255).toString(16),
                                                defaultConfig.endFillColor
                                            ]}
                                        />
                                    </Area>
                                )}

                                {/* Smooth Line */}
                                <Line
                                    points={points.y}
                                    color={defaultConfig.color1}
                                    strokeWidth={defaultConfig.thickness}
                                    curveType={curveType}
                                    animate={{ type: "timing", duration: defaultConfig.animationDuration }}
                                    connectMissingData={true}
                                    strokeCap="round"
                                    strokeJoin="round"
                                />

                                {/* Static Data Points */}
                                {showDataPoints && points.y
                                    .filter((point): point is { x: number; y: number; xValue: number; yValue: number } =>
                                        typeof point.x === 'number' && typeof point.y === 'number'
                                    )
                                    .map((point, index) => (
                                        <Circle
                                            key={`static-point-${index}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r={pointSize}
                                            color={defaultConfig.color1}
                                        />
                                    ))}

                                {/* Enhanced Active point indicator */}
                                {(isActive || isManuallyActive) && (
                                    <>
                                        {/* Large outer glow */}
                                        <Circle
                                            cx={state.x.position}
                                            cy={state.y.y.position}
                                            r={pointSize * 3} // 3x the data point size
                                            color={defaultConfig.color1 + '26'} // 15% opacity
                                        />
                                        {/* Medium ring */}
                                        <Circle
                                            cx={state.x.position}
                                            cy={state.y.y.position}
                                            r={pointSize * 2} // 2x the data point size
                                            color={defaultConfig.color1 + '4D'} // 30% opacity
                                        />
                                        {/* Main dot */}
                                        <Circle
                                            cx={state.x.position}
                                            cy={state.y.y.position}
                                            r={pointSize * 1.25} // 1.25x the data point size
                                            color={defaultConfig.color1}
                                        />
                                        {/* White center */}
                                        <Circle
                                            cx={state.x.position}
                                            cy={state.y.y.position}
                                            r={pointSize * 0.5} // 0.5x the data point size
                                            color={Colors[theme].background}
                                        />
                                    </>
                                )}
                            </>
                        );
                    }}
                </CartesianChart>

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

                {/* Static Data Point Tooltips */}
                {showDataPoints && showDataPointTooltip && !isActive && !isManuallyActive && (
                    <>
                        {staticTooltipPositions.map((position, index) => (
                            <View
                                key={`static-tooltip-${index}`}
                                style={[
                                    Platform.OS === 'ios' ? styles.iosTooltip : styles.tooltip,
                                    {
                                        position: 'absolute',
                                        left: position.x - (defaultTooltipConfig.minWidth / 2),
                                        top: position.y - 40, // Offset above the data point
                                        backgroundColor: defaultTooltipConfig.backgroundColor,
                                        borderRadius: defaultTooltipConfig.borderRadius,
                                        paddingHorizontal: defaultTooltipConfig.paddingHorizontal,
                                        paddingVertical: defaultTooltipConfig.paddingVertical,
                                        minWidth: defaultTooltipConfig.minWidth,
                                        opacity: 0.8,
                                        zIndex: 100,
                                    }
                                ]}
                            >
                                <Text style={[
                                    Platform.OS === 'ios' ? styles.iosTooltipText : styles.tooltipText,
                                    {
                                        color: defaultTooltipConfig.textColor,
                                        fontSize: defaultTooltipConfig.fontSize - 2, // Slightly smaller for static tooltips
                                        fontWeight: defaultTooltipConfig.fontWeight as any,
                                    }
                                ]}>
                                    {formatValue(position.value)}
                                </Text>
                            </View>
                        ))}
                    </>
                )}
            </View>
        </ThemedView>
    );
};

export default memo(GestureLineChart); 