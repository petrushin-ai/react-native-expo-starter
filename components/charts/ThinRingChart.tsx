import { useFont } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Pie, PolarChart } from 'victory-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

// We'll use require for the font to avoid TypeScript issues with .ttf imports
const SpaceMono = require('../../assets/fonts/SpaceMono-Regular.ttf');

// Default colors for ring chart segments
const DEFAULT_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#64748B'
];

interface ThinRingChartData {
    label: string;
    value: number;
    color?: string;
}

interface LegendItem {
    label: string;
    color: string;
    value: number;
    percentage: number;
    isHighlighted: boolean;
    originalIndex: number;
}

interface ThinRingChartProps {
    data: ThinRingChartData[];
    title?: string;
    description?: string;
    theme?: 'light' | 'dark';
    size?: number;
    ringThickness?: number; // Thickness of the ring in pixels
    showLegend?: boolean;
    showCenterValue?: boolean;
    centerLabel?: string;
    onLegendItemPress?: (item: LegendItem, index: number) => void;
}

const ThinRingChart: React.FC<ThinRingChartProps> = ({
    data,
    title,
    description,
    theme = 'light',
    size = 280, // Increased default size for full width usage
    ringThickness = 10,
    showLegend = true,
    showCenterValue = true,
    centerLabel = 'Total',
    onLegendItemPress,
}) => {
    // Note: Using parent container dimensions instead of screen width for better responsiveness

    // Define styles first
    const styles = StyleSheet.create({
        container: {
            margin: 0, // Remove margins for maximum width
            padding: 0, // Remove padding for maximum width
            borderRadius: 16,
            alignItems: 'center',
            backgroundColor: Colors[theme]?.card || '#ffffff',
            // Use 100% width to fill parent container
            width: '100%',
            alignSelf: 'center',
        },
        title: {
            marginBottom: 4,
            textAlign: 'center',
            paddingHorizontal: 16, // Add padding only to text elements
        },
        description: {
            marginBottom: 16,
            textAlign: 'center',
            opacity: 0.7,
            fontSize: 12,
            paddingHorizontal: 16, // Add padding only to text elements
        },
        chartContainer: {
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            paddingTop: 16, // Add some top padding
        },
        chartWrapper: {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        centerContent: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [
                { translateX: -40 },
                { translateY: -30 }
            ],
            width: 80,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
        },
        centerValue: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 28,
        },
        centerLabel: {
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 16,
            marginTop: 2,
            opacity: 0.7,
        },
        legendContainer: {
            paddingVertical: 16,
            paddingHorizontal: 16, // Add horizontal padding for legend
            marginTop: 20,
            flexDirection: 'column',
            width: '100%',
        },
        legendItemBase: {
            borderRadius: 12,
            overflow: 'hidden',
        },
        legendItemSecondary: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            paddingVertical: 16,
            paddingHorizontal: 16,
            minHeight: 84,
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
            minWidth: 100,
        },
        legendTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#2563EB',
            flexShrink: 1,
        },
        legendTitleSecondaryDark: {
            color: '#6B7280',
        },
        legendTitleSelected: {
            color: '#2563EB',
        },
        legendValue: {
            fontSize: 30,
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
            fontSize: 16,
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
        legendIndicator: {
            marginBottom: 4,
        },
    });

    // Early validation - ensure we have valid data
    if (!data || !Array.isArray(data) || data.length === 0) {
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
                <View style={[styles.chartContainer, { width: size, height: size }]}>
                    <ThemedText style={{ opacity: 0.5, paddingHorizontal: 16 }}>No data available</ThemedText>
                </View>
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
            isHighlighted: false,
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
    }, [processedData]);

    // State management
    const [internalHighlightedIndex, setInternalHighlightedIndex] = useState<number | null>(null);
    const [selectedCenterItem, setSelectedCenterItem] = useState<LegendItem | null>(null);
    const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);

    // Chart data with highlighting support
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

            onLegendItemPress?.(item, index);
        }
    }, [onLegendItemPress, processedData]);

    // Get the effective highlighted index
    const effectiveHighlightedIndex = internalHighlightedIndex;

    // Calculate responsive size based on parent container
    const responsiveSize = Math.min(size, 300); // Max 300px, use provided size as default

    // Calculate the innerRadius to create thin ring effect
    const outerRadius = responsiveSize / 2;
    const innerRadius = outerRadius - ringThickness;
    const innerRadiusPercentage = `${(innerRadius / outerRadius) * 100}%`;

    // Legend component
    const renderLegend = () => {
        if (!showLegend) return null;

        return (
            <View style={styles.legendContainer}>
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
                                <View style={styles.legendValueContainer}>
                                    <ThemedText
                                        style={[
                                            styles.legendValue,
                                            theme === 'dark' && styles.legendValueSecondaryDark,
                                            isSelected && styles.legendValueSelected,
                                        ]}
                                    >
                                        {isTotal ?
                                            `${item.percentage?.toFixed(1)}%` :
                                            `${item.percentage?.toFixed(1)}%`
                                        }
                                    </ThemedText>
                                    {!isTotal && item.value !== item.percentage && (
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
                <View style={styles.centerContent}>
                    <ThemedText style={styles.centerValue}>
                        {selectedCenterItem.value}
                    </ThemedText>
                    <ThemedText style={styles.centerLabel}>
                        {selectedCenterItem.label}
                    </ThemedText>
                    <ThemedText style={[styles.centerLabel, { opacity: 0.7 }]}>
                        {selectedCenterItem.percentage?.toFixed(1)}%
                    </ThemedText>
                </View>
            );
        }

        // Default: show total values
        return (
            <View style={styles.centerContent}>
                <ThemedText style={styles.centerValue}>
                    {total}
                </ThemedText>
                <ThemedText style={styles.centerLabel}>
                    {centerLabel}
                </ThemedText>
                <ThemedText style={[styles.centerLabel, { opacity: 0.7 }]}>
                    100%
                </ThemedText>
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
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
                        width: responsiveSize,
                        height: responsiveSize,
                        alignSelf: 'center',
                    }
                ]}>
                    <View style={{
                        height: responsiveSize,
                        width: responsiveSize,
                    }}>
                        <PolarChart
                            data={chartData}
                            labelKey="label"
                            valueKey="value"
                            colorKey="color"
                        >
                            <Pie.Chart innerRadius={innerRadiusPercentage}>
                                {({ slice }) => {
                                    const isActive = activeSliceIndex !== null &&
                                        processedData[activeSliceIndex]?.label === slice.label;
                                    return (
                                        <Pie.Slice key={slice.label || `slice-${Math.random()}`}>
                                            <Pie.SliceAngularInset
                                                angularInset={{
                                                    angularStrokeWidth: 2,
                                                    angularStrokeColor: Colors[theme]?.background || '#ffffff',
                                                }}
                                            />
                                        </Pie.Slice>
                                    );
                                }}
                            </Pie.Chart>
                        </PolarChart>
                    </View>

                    {/* Center Content */}
                    {renderCenterContent()}
                </View>

                {/* Legend Below Chart */}
                {renderLegend()}
            </View>
        </ThemedView>
    );
};

export default memo(ThinRingChart); 