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
        const baseMargins = 32; // Total horizontal margins (16px each side)
        const cardPadding = 40; // Card internal padding (20px each side)
        const availableWidth = screenWidth - baseMargins - cardPadding;

        // Calculate optimal spacing for 12 months
        const minBarWidth = 16;
        const optimalBarWidth = Math.max(minBarWidth, Math.floor((availableWidth - 120) / data.length)); // Reserve 120px for padding

        return {
            containerWidth: availableWidth,
            barWidth: optimalBarWidth,
            spacing: Math.max(4, Math.floor((availableWidth - (optimalBarWidth * data.length)) / (data.length + 1))),
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

    // Default configuration with improved responsive padding
    const defaultConfig = {
        height: 220,
        // Better responsive padding that ensures all labels show
        padding: {
            left: Math.max(20, responsiveDims.spacing),
            right: Math.max(20, responsiveDims.spacing),
            top: 40,
            bottom: 20
        },
        // Improved domain padding for all 12 months
        domainPadding: {
            left: Math.max(15, responsiveDims.spacing / 2),
            right: Math.max(15, responsiveDims.spacing / 2),
            top: 40,
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
            margin: 16,
            padding: 20,
            borderRadius: 16,
            backgroundColor: Colors[theme].card,
            alignItems: 'center',
            // Ensure container takes full available width
            width: screenWidth - 32,
            alignSelf: 'center',
        },
        title: {
            marginBottom: 4,
            textAlign: 'center',
        },
        description: {
            marginBottom: 16,
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
            marginTop: 12,
            padding: 8,
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
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 50,
            zIndex: 1000,
        },
        tooltipText: {
            color: '#ffffff',
            fontSize: 14,
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