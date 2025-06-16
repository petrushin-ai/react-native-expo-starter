import { LinearGradient, useFont, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { memo, useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text } from 'react-native';
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
import { Bar, CartesianChart, useChartPressState } from 'victory-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
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
}) => {
    // Load font using Skia's useFont hook
    const font = useFont(SpaceMono, 12);

    // Responsive dimensions calculation
    const { width: screenWidth } = Dimensions.get('window');

    // Better responsive calculation with grid-based approach
    const responsiveCalculations = () => {
        const baseMargins = 20; // Reduced from 32px - Total horizontal margins (10px each side)
        const cardPadding = 24; // Reduced from 40px - Card internal padding (12px each side)
        const availableWidth = screenWidth - baseMargins - cardPadding;

        // Calculate optimal spacing for 12 months with more aggressive space usage
        const minBarWidth = 18; // Increased minimum bar width
        const reservedPadding = 80; // Reduced from 120px for chart padding
        const optimalBarWidth = Math.max(minBarWidth, Math.floor((availableWidth - reservedPadding) / data.length));

        return {
            containerWidth: availableWidth,
            barWidth: optimalBarWidth,
            spacing: Math.max(2, Math.floor((availableWidth - (optimalBarWidth * data.length)) / (data.length + 1))), // Reduced min spacing
        };
    };

    const responsiveDims = responsiveCalculations();

    // Set up chart press state for interactions
    const { state, isActive } = useChartPressState({
        x: 0,
        y: { value: 0 }
    });

    // Tooltip state
    const [tooltipValue, setTooltipValue] = useState('');
    const [previousDataIndex, setPreviousDataIndex] = useState<number | null>(null);

    // Smooth transition for tooltip
    const smoothTransition = useSharedValue(0);

    // Format value for tooltip - WORKLET VERSION
    const formatValue = (value: number): string => {
        'worklet';
        if (value >= 1000) {
            const thousands = value / 1000;
            const formatted = thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1);
            return `${formatted}k`;
        }
        return String(value);
    };

    // Update tooltip value
    const updateTooltipValueWithHaptic = (value: string, dataIndex: number) => {
        setTooltipValue(value);
        // Only trigger haptic if we moved to a different data point
        if (previousDataIndex !== null && previousDataIndex !== dataIndex && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setPreviousDataIndex(dataIndex);
    };

    // Function to update tooltip from UI thread - WORKLET
    const updateTooltip = (xValue: number, yValue: number) => {
        'worklet';
        // Get the closest data point index
        const index = Math.round(xValue);
        const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
        const dataPoint = data[clampedIndex];

        if (dataPoint) {
            const formattedValue = formatValue(dataPoint.value); // Use actual data value, not yValue
            runOnJS(updateTooltipValueWithHaptic)(formattedValue, clampedIndex);
        }
    };

    // Use derived value to track changes and update tooltip
    useDerivedValue(() => {
        if (isActive && data.length > 0) {
            const xValue = state.x.value.value;
            const yValue = state.y.value.value.value;
            updateTooltip(xValue, yValue);
        }
        return null;
    });

    // Handle press events with haptic feedback
    useEffect(() => {
        if (!isActive) {
            setTooltipValue('');
            setPreviousDataIndex(null);
            smoothTransition.value = withSpring(0, { damping: 15, stiffness: 120 });
        } else {
            const showConfig = Platform.OS === 'ios'
                ? { damping: 30, stiffness: 500 }
                : { damping: 15, stiffness: 150 };
            smoothTransition.value = withSpring(1, showConfig);
        }

        // Call the provided callback if available
        if (isActive && onBarPress && state.x.value !== undefined) {
            const index = Math.round(state.x.value.value);
            if (index >= 0 && index < data.length) {
                onBarPress(data[index], index);
            }
        }
    }, [isActive, state.x.value, data, onBarPress]);

    // Default configuration with optimized space usage
    const defaultConfig = {
        height: 220,
        // Minimal responsive padding for maximum chart space
        padding: {
            left: Math.max(12, responsiveDims.spacing), // Reduced from 20
            right: Math.max(12, responsiveDims.spacing), // Reduced from 20
            top: 30, // Reduced from 40
            bottom: 16 // Reduced from 20
        },
        // Minimal domain padding for maximum bar space
        domainPadding: {
            left: Math.max(8, responsiveDims.spacing / 2), // Reduced from 15
            right: Math.max(8, responsiveDims.spacing / 2), // Reduced from 15
            top: 30, // Reduced from 40
            bottom: 0
        },
        barColor: Colors[theme].tint || '#177AD5',
        gradientColors: [
            Colors[theme].tint || '#177AD5',
            (Colors[theme].tint || '#177AD5') + '50'
        ] as [string, string],
        roundedCorners: {
            topLeft: 4,
            topRight: 4,
        },
        xAxisConfig: {
            font,
            labelColor: theme === 'dark' ? '#ccc' : '#666',
            lineColor: theme === 'dark' ? '#444' : '#e0e0e0',
            lineWidth: 1,
            // Ensure we show all labels
            tickCount: data.length,
            formatXLabel: (value: any) => {
                if (typeof value === 'number') {
                    const index = Math.round(value);
                    if (index >= 0 && index < data.length) {
                        return data[index]?.label || String(value);
                    }
                }
                return String(value);
            },
        },
        yAxisConfig: {
            font,
            labelColor: theme === 'dark' ? '#ccc' : '#666',
            lineColor: theme === 'dark' ? '#444' : '#e0e0e0',
            lineWidth: 1,
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
        },
        isAnimated: true,
        animationDuration: 800,
        domain: undefined as { x?: [number, number]; y?: [number, number] } | undefined,
    };

    // Merge default config with provided config
    const mergedConfig = { ...defaultConfig, ...config };

    // Prepare data for Victory Native XL (ensure proper format)
    const formattedData = data.map((item, index) => ({
        x: index, // Use index as x-value for proper positioning
        value: item.value,
        label: item.label,
        originalIndex: index,
    }));

    const selectedItem = selectedIndex !== null && selectedIndex !== undefined ? data[selectedIndex] : null;

    // Tooltip animated style
    const tooltipAnimatedStyle = useAnimatedStyle(() => {
        const tooltipWidth = 80;

        const animationDuration = Platform.OS === 'ios' ? 0 : 150;
        const springConfig = Platform.OS === 'ios'
            ? { damping: 30, stiffness: 500 }
            : { damping: 15, stiffness: 150 };

        const transitionOpacity = interpolate(
            smoothTransition.value,
            [0, 0.3, 1],
            [0, 0.7, 1],
            Extrapolate.CLAMP
        );

        return {
            opacity: withTiming(
                isActive ? transitionOpacity : 0,
                { duration: animationDuration }
            ),
            transform: [
                {
                    translateX: state.x.position.value - tooltipWidth / 2,
                },
                {
                    translateY: state.y.value.position.value - 55,
                },
                {
                    scale: withSpring(
                        isActive ? 1 : 0.8,
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
        chartContainer: {
            width: responsiveDims.containerWidth,
            height: mergedConfig.height,
            position: 'relative',
            // Ensure proper overflow handling
            overflow: 'visible',
        },
        selectionInfo: {
            marginTop: 8, // Reduced from 12px
            padding: 6, // Reduced from 8px
            borderRadius: 8,
            backgroundColor: Colors[theme].surface,
        },
        selectionText: {
            fontSize: 12,
            fontWeight: '500',
        },
        tooltip: {
            position: 'absolute',
            backgroundColor: Colors[theme].tint || '#177AD5',
            paddingHorizontal: 10, // Reduced from 12px
            paddingVertical: 5, // Reduced from 6px
            borderRadius: 12, // Reduced from 15px
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 45, // Reduced from 50px
            zIndex: 1000,
        },
        tooltipText: {
            color: '#ffffff',
            fontSize: 13, // Reduced from 14px
            fontWeight: '500',
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

            <ThemedView style={styles.chartContainer}>
                <CartesianChart
                    data={formattedData}
                    xKey="x"
                    yKeys={["value"]}
                    padding={mergedConfig.padding}
                    domainPadding={mergedConfig.domainPadding}
                    domain={mergedConfig.domain}
                    xAxis={mergedConfig.xAxisConfig}
                    yAxis={[mergedConfig.yAxisConfig]}
                    chartPressState={state}
                >
                    {({ points, chartBounds }) => (
                        <Bar
                            points={points.value}
                            chartBounds={chartBounds}
                            roundedCorners={mergedConfig.roundedCorners}
                        >
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(0, mergedConfig.height)}
                                colors={mergedConfig.gradientColors}
                            />
                        </Bar>
                    )}
                </CartesianChart>

                {/* Tooltip */}
                {isActive && tooltipValue && (
                    <Animated.View style={[styles.tooltip, tooltipAnimatedStyle]}>
                        <Text style={styles.tooltipText}>
                            {tooltipValue}
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