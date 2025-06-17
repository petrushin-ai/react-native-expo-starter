import { useFont } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring
} from 'react-native-reanimated';
import { Pie, PolarChart } from 'victory-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useChartAppearAnimation } from '@/hooks/useChartAppearAnimation';
import type { InteractiveRingChartProps, LegendConfig, LegendItem } from './types';

// We'll use require for the font to avoid TypeScript issues with .ttf imports
const SpaceMono = require('../../assets/fonts/SpaceMono-Regular.ttf');

// Default colors for ring chart segments
const DEFAULT_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#64748B'
];

const InteractiveRingChart: React.FC<InteractiveRingChartProps> = ({
    data,
    config = {},
    title,
    description,
    theme = 'light',
    selectedIndex,
    highlightedIndex,
    onSlicePress,
    showLegend = true,
    legendConfig = {},
    onLegendItemPress,
    showCenterValue = false,
    centerValue,
    centerLabel,
    centerTextSize = 24,
    centerTextColor,
    showTooltip = true,
    tooltipConfig = {},
    padding,
    enableAppearAnimation = false,
    appearAnimationType = 'spring',
    appearAnimationDuration = 800,
    appearAnimationStagger = true,
    appearAnimationStaggerDelay = 100,
    onAppearAnimationComplete,
}) => {
    // Responsive dimensions calculation
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

    // Enhanced data processing with percentage calculation
    const processedData = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.value, 0);

        return data.map((item, index) => ({
            ...item,
            originalIndex: index,
            percentage: total > 0 ? (item.value / total) * 100 : 0,
            color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        }));
    }, [data]);

    // Legend data processing with total item
    const legendData = useMemo((): LegendItem[] => {
        const total = processedData.reduce((sum, item) => sum + item.value, 0);

        const items = processedData.map((item, index) => ({
            label: item.label,
            color: item.color,
            value: item.value,
            percentage: item.percentage,
            isHighlighted: highlightedIndex === index,
            originalIndex: index
        }));

        // Add total item at the beginning
        const totalItem = {
            label: 'Total',
            color: '#64748B', // Gray color for total
            value: total,
            percentage: 100,
            isHighlighted: false,
            originalIndex: -1 // Special index for total
        };

        return [totalItem, ...items];
    }, [processedData, highlightedIndex]);

    // Default configurations
    const defaultConfig = {
        width: 300,
        height: 300,
        size: Math.min(280, screenWidth * 0.7),
        innerRadius: '50%',
        outerRadius: undefined,
        padAngle: 2,
        cornerRadius: 4,
        startAngle: 0,
        endAngle: 360,
        circleSweepDegrees: 360,
        isAnimated: true,
        animationDuration: 1000,
        animateOnDataChange: true,
        onDataChangeAnimationDuration: 600,
        strokeWidth: 0,
        strokeColor: '#ffffff',
        showLabels: false,
        labelFont: font,
        labelColor: theme === 'dark' ? '#ffffff' : '#000000',
        labelRadiusOffset: 0.1,
        labelPosition: 'centroid' as const,
        labelPlacement: 'vertical' as const,
        ...config
    };

    const defaultLegendConfig: LegendConfig = {
        position: 'right',
        alignment: 'start',
        itemSpacing: 8,
        rowSpacing: 12,
        itemsPerRow: 1,
        showValues: true,
        showPercentages: true,
        fontSize: 14,
        fontWeight: '500',
        textColor: Colors[theme]?.text || '#000000',
        highlightTextColor: Colors[theme]?.tint || '#3B82F6',
        backgroundColor: 'transparent',
        borderRadius: 8,
        padding: 12,
        indicatorSize: 12,
        indicatorShape: 'circle',
        ...legendConfig
    };

    // State management
    const [internalHighlightedIndex, setInternalHighlightedIndex] = useState<number | null>(null);
    const [selectedCenterItem, setSelectedCenterItem] = useState<LegendItem | null>(null);
    const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);

    // Animation values
    const highlightOpacity = useSharedValue(1);
    const chartScale = useSharedValue(1);

    // Chart data with highlighting support (similar to DonutChart.tsx)
    const chartData = useMemo(() => {
        return processedData.map((item, index) => ({
            ...item,
            color: activeSliceIndex === null
                ? item.color
                : activeSliceIndex === index
                    ? item.color
                    : `${item.color}40`, // Much more transparent when not active (25% opacity)
        }));
    }, [processedData, activeSliceIndex]);

    // Use the reusable animation hook
    const { animatedData: currentAnimatedData } = useChartAppearAnimation(chartData, {
        enableAnimation: enableAppearAnimation,
        animationType: appearAnimationType,
        duration: appearAnimationDuration,
        enableStagger: appearAnimationStagger,
        staggerDelay: appearAnimationStaggerDelay,
        onComplete: onAppearAnimationComplete
    });

    // Animation effects for slice highlighting
    useEffect(() => {
        if (activeSliceIndex !== null) {
            // Animate when a slice becomes active
            chartScale.value = withSequence(
                withSpring(1.02, { damping: 20, stiffness: 300 }),
                withSpring(1, { damping: 15, stiffness: 120 })
            );
        } else {
            // Return to normal when no slice is active
            chartScale.value = withSpring(1, { damping: 15, stiffness: 120 });
        }
    }, [activeSliceIndex]);

    // Handle legend item press with slice highlighting
    const handleLegendItemPress = useCallback((item: LegendItem, index: number) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const isTotal = item.originalIndex === -1;

        if (isTotal) {
            // Total button: clear all highlights and show total in center
            setInternalHighlightedIndex(null);
            setSelectedCenterItem(null);
            setActiveSliceIndex(null);
            onLegendItemPress?.(item, index);
        } else {
            // Regular item: highlight this item and show its details in center
            const sliceIndex = item.originalIndex;
            setInternalHighlightedIndex(sliceIndex);
            setSelectedCenterItem(item);
            setActiveSliceIndex(sliceIndex);

            // Trigger onSlicePress callback since we're simulating slice interaction through legend
            onSlicePress?.(processedData[sliceIndex], sliceIndex);
            onLegendItemPress?.(item, index);

            // Highlight animation feedback
            highlightOpacity.value = withSpring(0.6, { damping: 15, stiffness: 200 });
            setTimeout(() => {
                highlightOpacity.value = withSpring(1, { damping: 15, stiffness: 200 });
            }, 150);
        }
    }, [onLegendItemPress, onSlicePress, processedData, highlightOpacity]);

    // Get the effective highlighted index
    const effectiveHighlightedIndex = highlightedIndex ?? internalHighlightedIndex;

    // Responsive layout calculations
    const responsiveCalculations = useMemo(() => {
        const containerMargins = 32; // marginHorizontal: 16 * 2
        const containerPadding = 48; // padding: 24 * 2
        const totalMargins = containerMargins + containerPadding;
        const availableWidth = screenWidth - totalMargins;

        // Ensure chart fits within available space with some buffer
        const chartSize = Math.min(availableWidth, screenWidth * 0.7, 300);

        return {
            chartSize,
        };
    }, [screenWidth]);

    // Chart animated style
    const chartAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: chartScale.value }],
        };
    });

    // Legend component
    const renderLegend = () => {
        if (!showLegend) return null;

        return (
            <View style={[
                styles.legendContainer,
                {
                    width: '100%',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginTop: 16,
                    flexDirection: 'column',
                }
            ]}>
                {legendData.map((item, index) => {
                    const isHighlighted = effectiveHighlightedIndex === index;
                    const isTotal = item.originalIndex === -1;
                    const isTotalSelected = selectedCenterItem === null && isTotal; // Total is selected when no specific item is selected

                    return (
                        <TouchableOpacity
                            key={`legend-${index}`}
                            style={[
                                styles.legendItem,
                                {
                                    marginBottom: defaultLegendConfig.rowSpacing,
                                    width: '100%',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    backgroundColor: (isHighlighted || isTotalSelected) ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                    borderRadius: 6,
                                }
                            ]}
                            onPress={() => handleLegendItemPress(item, index)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.legendIndicator,
                                    {
                                        width: defaultLegendConfig.indicatorSize,
                                        height: defaultLegendConfig.indicatorSize,
                                        backgroundColor: item.color,
                                        borderRadius: defaultLegendConfig.indicatorShape === 'circle'
                                            ? defaultLegendConfig.indicatorSize! / 2 : 2,
                                        opacity: isHighlighted || isTotalSelected ? 1 : 0.6,
                                        transform: [{ scale: isHighlighted || isTotalSelected ? 1.2 : 1 }],
                                        marginRight: 12,
                                        borderWidth: isHighlighted ? 2 : 0,
                                        borderColor: isHighlighted ? '#3B82F6' : 'transparent',
                                    }
                                ]}
                            />
                            <View style={[styles.legendText, { flex: 1 }]}>
                                <ThemedText
                                    style={[
                                        {
                                            fontSize: isTotal ? defaultLegendConfig.fontSize! + 1 : defaultLegendConfig.fontSize,
                                            fontWeight: isTotal ? 'bold' : defaultLegendConfig.fontWeight as any,
                                            color: isHighlighted
                                                ? defaultLegendConfig.highlightTextColor
                                                : defaultLegendConfig.textColor,
                                        }
                                    ]}
                                >
                                    {item.label}
                                </ThemedText>
                                {(defaultLegendConfig.showValues || defaultLegendConfig.showPercentages) && (
                                    <ThemedText
                                        style={[
                                            {
                                                fontSize: (defaultLegendConfig.fontSize! - 2),
                                                color: isHighlighted
                                                    ? defaultLegendConfig.highlightTextColor
                                                    : defaultLegendConfig.textColor,
                                                opacity: 0.7,
                                            }
                                        ]}
                                    >
                                        {isTotal ? `${item.value} total` :
                                            defaultLegendConfig.showValues && defaultLegendConfig.showPercentages
                                                ? `${item.value} (${item.percentage?.toFixed(1)}%)`
                                                : defaultLegendConfig.showValues
                                                    ? `${item.value}`
                                                    : `${item.percentage?.toFixed(1)}%`
                                        }
                                    </ThemedText>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    // Center content component for donut charts
    const renderCenterContent = () => {
        if (!showCenterValue) return null;

        // Calculate total for display
        const total = processedData.reduce((sum, item) => sum + item.value, 0);

        // If a specific item is selected, show its details
        if (selectedCenterItem && selectedCenterItem.originalIndex !== -1) {
            return (
                <View style={[
                    styles.centerContent,
                    {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: [
                            { translateX: -60 },
                            { translateY: -40 }
                        ],
                        width: 120,
                        height: 80,
                    }
                ]}>
                    <ThemedText
                        style={[
                            styles.centerValue,
                            {
                                fontSize: centerTextSize || 32,
                                fontWeight: 'bold',
                                color: centerTextColor,
                            }
                        ]}
                    >
                        {selectedCenterItem.value}
                    </ThemedText>
                    <ThemedText
                        style={[
                            styles.centerLabel,
                            {
                                fontSize: 16,
                                fontWeight: '600',
                                color: centerTextColor,
                            }
                        ]}
                    >
                        {selectedCenterItem.label}
                    </ThemedText>
                    <ThemedText
                        style={[
                            styles.centerLabel,
                            {
                                fontSize: 14,
                                color: centerTextColor,
                                opacity: 0.7,
                            }
                        ]}
                    >
                        {selectedCenterItem.percentage?.toFixed(1)}%
                    </ThemedText>
                </View>
            );
        }

        // Default: show total values
        return (
            <View style={[
                styles.centerContent,
                {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: [
                        { translateX: -60 },
                        { translateY: -40 }
                    ],
                    width: 120,
                    height: 80,
                }
            ]}>
                <ThemedText
                    style={[
                        styles.centerValue,
                        {
                            fontSize: centerTextSize || 32,
                            fontWeight: 'bold',
                            color: centerTextColor,
                        }
                    ]}
                >
                    {total}
                </ThemedText>
                <ThemedText
                    style={[
                        styles.centerLabel,
                        {
                            fontSize: 16,
                            fontWeight: '600',
                            color: centerTextColor,
                        }
                    ]}
                >
                    {centerLabel || 'Total'}
                </ThemedText>
                <ThemedText
                    style={[
                        styles.centerLabel,
                        {
                            fontSize: 14,
                            color: centerTextColor,
                            opacity: 0.7,
                        }
                    ]}
                >
                    100%
                </ThemedText>
            </View>
        );
    };

    return (
        <ThemedView style={[
            styles.container,
            theme === 'dark' && styles.containerDark,
            {
                backgroundColor: Colors[theme]?.card || '#ffffff',
            }
        ]}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.title}>{title}</ThemedText>
                {description && (
                    <ThemedText style={styles.description}>{description}</ThemedText>
                )}
            </View>

            {/* Chart and Legend Container */}
            <View style={[
                styles.chartContainer,
                {
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%'
                }
            ]}>
                {/* Ring Chart Container */}
                <View style={[
                    styles.chartWrapper,
                    {
                        width: responsiveCalculations.chartSize,
                        height: responsiveCalculations.chartSize,
                        alignSelf: 'center',
                    }
                ]}>
                    <Animated.View style={[
                        {
                            height: responsiveCalculations.chartSize,
                            width: responsiveCalculations.chartSize,
                        },
                        chartAnimatedStyle
                    ]}>
                        <PolarChart
                            data={chartData}
                            labelKey="label"
                            valueKey="value"
                            colorKey="color"
                        >
                            <Pie.Chart innerRadius="70%">
                                {({ slice }) => {
                                    const isActive = activeSliceIndex !== null &&
                                        processedData[activeSliceIndex]?.label === slice.label;
                                    return (
                                        <Pie.Slice key={slice.label || `slice-${Math.random()}`}>
                                            {isActive && (
                                                <Pie.SliceAngularInset
                                                    angularInset={{
                                                        angularStrokeWidth: 3,
                                                        angularStrokeColor: Colors[theme]?.background || '#ffffff',
                                                    }}
                                                />
                                            )}
                                        </Pie.Slice>
                                    );
                                }}
                            </Pie.Chart>
                        </PolarChart>
                    </Animated.View>

                    {/* Center Content */}
                    {renderCenterContent()}
                </View>

                {/* Legend Below Chart */}
                {renderLegend()}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    containerDark: {
        backgroundColor: '#1F2937',
        shadowColor: '#000',
        shadowOpacity: 0.3,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        opacity: 0.7,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    centerValue: {
        textAlign: 'center',
        lineHeight: 36,
    },
    centerLabel: {
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 2,
    },
    legendContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    legendItem: {
        marginBottom: 8,
        alignItems: 'center',
    },
    legendIndicator: {
        marginBottom: 4,
    },
    legendText: {
        alignItems: 'center',
    },
    tooltip: {
        position: 'absolute',
        top: 10,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        zIndex: 1000,
    },
    tooltipText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default memo(InteractiveRingChart); 