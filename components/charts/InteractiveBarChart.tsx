import { LinearGradient, useFont, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { memo, useEffect } from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
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

    // Get responsive dimensions
    const { width: screenWidth } = Dimensions.get('window');
    const containerWidth = screenWidth - 72; // Account for margins and padding

    // Set up chart press state for interactions
    const { state, isActive } = useChartPressState({
        x: 0,
        y: { value: 0 }
    });

    // Handle press events with haptic feedback
    useEffect(() => {
        if (isActive && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Call the provided callback if available
        if (isActive && onBarPress && state.x.value !== undefined) {
            const index = Math.round(state.x.value.value);
            if (index >= 0 && index < data.length) {
                onBarPress(data[index], index);
            }
        }
    }, [isActive, state.x.value, data, onBarPress]);

    // Default configuration with Victory Native XL patterns
    const defaultConfig = {
        height: 220,
        padding: { left: 16, right: 16, top: 20, bottom: 20 },
        domainPadding: { left: 20, right: 20, top: 30, bottom: 0 },
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
            formatXLabel: (value: any) => {
                if (typeof value === 'number') {
                    const index = Math.round(value);
                    return data[index]?.label || String(value);
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

    const styles = StyleSheet.create({
        container: {
            margin: 16,
            padding: 20,
            borderRadius: 16,
            backgroundColor: Colors[theme].card,
            alignItems: 'center',
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
            width: containerWidth,
            height: mergedConfig.height,
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