import { useFont } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
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
    // Note: Using parent container dimensions instead of screen width for better responsiveness

    // Early validation - ensure we have valid data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <ThemedView style={{
                margin: 0,
                padding: 0,
                borderRadius: 16,
                backgroundColor: Colors[theme]?.card || '#ffffff',
                alignItems: 'center',
                width: '100%',
                alignSelf: 'center',
            }}>
                {title && (
                    <ThemedText type="subtitle" style={{ marginBottom: 2, textAlign: 'center', paddingHorizontal: 16 }}>
                        {title}
                    </ThemedText>
                )}
                {description && (
                    <ThemedText style={{ marginBottom: 10, textAlign: 'center', opacity: 0.7, fontSize: 12, paddingHorizontal: 16 }}>
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
        size: 280, // Use fixed size that will be constrained by parent container
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

    // Simplified responsive calculation based on parent container
    const responsiveCalculations = () => {
        // Use a reasonable default chart size that will be constrained by parent
        const chartSize = Math.min(300, 280); // Max 300px, default 280px

        return {
            chartSize,
        };
    };

    const responsiveDims = responsiveCalculations();

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
                    paddingVertical: 16,
                    paddingBottom: 0,
                    paddingHorizontal: 0,
                    marginTop: 20,
                    flexDirection: 'column',
                }
            ]}>
                {legendData.map((item, index) => {
                    const isTotal = item.originalIndex === -1;
                    // For data items, check if their originalIndex matches the highlighted data index
                    const isDataItemSelected = !isTotal && effectiveHighlightedIndex === item.originalIndex;

                    // Total is never "selected" - it's just a reset button
                    const isSelected = isDataItemSelected;

                    // All items get secondary button styling (Total is never selected/highlighted)
                    const buttonStyle = [
                        styles.legendItemSecondary,
                        theme === 'dark' && styles.legendItemSecondaryDark,
                        isSelected && styles.legendItemSelected,
                        isSelected && theme === 'dark' && styles.legendItemSelectedDark
                    ];

                    return (
                        <TouchableOpacity
                            key={`legend-${index}`}
                            style={[
                                styles.legendItemBase,
                                buttonStyle,
                                {
                                    marginBottom: 12,
                                }
                            ]}
                            onPress={() => handleLegendItemPress(item, index)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.legendItemContent}>
                                <View
                                    style={[
                                        styles.legendIndicator,
                                        {
                                            width: isTotal ? 16 : 14,
                                            height: isTotal ? 16 : 14,
                                            backgroundColor: item.color,
                                            borderRadius: isTotal ? 8 : 7,
                                            marginRight: 16,
                                            borderWidth: isSelected && !isTotal ? 2 : 0,
                                            borderColor: isSelected ? '#2563EB' : 'transparent',
                                        }
                                    ]}
                                />
                                <View style={styles.legendTextContainer}>
                                    <ThemedText
                                        style={[
                                            styles.legendTitle,
                                            theme === 'dark' && styles.legendTitleSecondaryDark,
                                            isSelected && styles.legendTitleSelected,
                                        ]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item.label}
                                    </ThemedText>
                                </View>

                                {/* Values on the right side */}
                                {(defaultLegendConfig.showValues || defaultLegendConfig.showPercentages) && (() => {
                                    const isPercentageMode = !defaultLegendConfig.showValues && defaultLegendConfig.showPercentages;
                                    const showAbsoluteValues = defaultLegendConfig.showValues;
                                    const showPercentages = defaultLegendConfig.showPercentages;

                                    // For Total in percentage mode, don't show any value
                                    if (isTotal && isPercentageMode) {
                                        return null;
                                    }

                                    return (
                                        <View style={styles.legendValueContainer}>
                                            <ThemedText
                                                style={[
                                                    styles.legendValue,
                                                    theme === 'dark' && styles.legendValueSecondaryDark,
                                                    isSelected && styles.legendValueSelected,
                                                ]}
                                            >
                                                {isTotal ?
                                                    showPercentages ? `${item.percentage?.toFixed(1)}%` : `${item.value}` :
                                                    showPercentages
                                                        ? `${item.percentage?.toFixed(1)}%`
                                                        : `${item.value}`
                                                }
                                            </ThemedText>
                                            {!isTotal && showAbsoluteValues && showPercentages && item.value !== item.percentage && (
                                                <ThemedText
                                                    style={[
                                                        styles.legendPercentage,
                                                        theme === 'dark' && styles.legendPercentageSecondaryDark,
                                                        isSelected && styles.legendPercentageSelected,
                                                    ]}
                                                >
                                                    {`${item.value}`}
                                                </ThemedText>
                                            )}
                                        </View>
                                    );
                                })()}
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

    const styles = StyleSheet.create({
        container: {
            margin: 0, // Remove margins for maximum width
            padding: 0, // Remove padding for maximum width
            borderRadius: 16,
            marginTop: 20,
            backgroundColor: Colors[theme]?.card || '#ffffff',
            alignItems: 'center',
            // Use 100% width to fill parent container
            width: '100%',
            alignSelf: 'center',
        },
        title: {
            marginBottom: 2, // Reduced from 4px
            textAlign: 'center',
            paddingHorizontal: 16, // Add padding only to text elements
        },
        description: {
            marginBottom: 10, // Reduced from 16px
            textAlign: 'center',
            opacity: 0.7,
            fontSize: 12,
            paddingHorizontal: 16, // Add padding only to text elements
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
            paddingHorizontal: 16, // Add horizontal padding for legend
        },
        legendItemBase: {
            borderRadius: 12,
            overflow: 'hidden',
        },
        legendItemPrimary: {
            backgroundColor: '#2563EB',
            paddingVertical: 18,
            paddingHorizontal: 16,
        },
        legendItemSecondary: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            paddingVertical: 16,
            paddingHorizontal: 16,
            minHeight: 84, // Increased by 14px (from 70 to 84)
        },
        legendItemSecondaryDark: {
            borderColor: '#374151',
        },
        legendItemSelected: {
            backgroundColor: '#EFF6FF',
            borderColor: '#2563EB',
        },
        legendItemSelectedDark: {
            backgroundColor: '#1E3A8A',
            borderColor: '#3B82F6',
        },
        legendItemContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        legendTextContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        legendValueContainer: {
            alignItems: 'flex-end',
            justifyContent: 'center',
            minWidth: 100, // Ensure consistent width for values
        },
        legendTitle: {
            fontSize: 20, // Reduced by 2px (from 18 to 16)
            fontWeight: '400',
            color: '#2563EB',
            flexShrink: 1, // Allow text to shrink if needed
        },
        legendTitlePrimary: {
            color: '#fff',
        },
        legendTitleSecondaryDark: {
            color: '#6B7280',
        },
        legendTitleSelected: {
            color: '#2563EB',
        },
        legendValue: {
            fontSize: 30, // Reduced from 42
            fontWeight: '700',
            color: '#333',
            lineHeight: 36,
            textAlign: 'right',
        },
        legendValueSecondaryDark: {
            color: '#E5E7EB',
        },
        legendValueSelected: {
            color: '#1D4ED8',
        },
        legendPercentage: {
            fontSize: 16, // Reduced from 24
            fontWeight: '500',
            color: '#666',
            textAlign: 'right',
            marginTop: 2,
        },
        legendPercentageSecondaryDark: {
            color: '#9CA3AF',
        },
        legendPercentageSelected: {
            color: '#1D4ED8',
        },
        legendDescription: {
            fontSize: 14,
            color: '#666',
        },
        legendDescriptionPrimary: {
            color: 'rgba(255, 255, 255, 0.8)',
        },
        legendDescriptionSecondaryDark: {
            color: '#9CA3AF',
        },
        legendDescriptionSelected: {
            color: '#1D4ED8',
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
                        width: responsiveDims.chartSize,
                        height: responsiveDims.chartSize,
                        alignSelf: 'center',
                    }
                ]}>
                    <Animated.View style={[
                        {
                            height: responsiveDims.chartSize,
                            width: responsiveDims.chartSize,
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

export default memo(InteractiveRingChart); 