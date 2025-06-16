import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import type { BarDataItem, InteractiveBarChartProps } from './types';

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
    // Get responsive dimensions
    const { width: screenWidth } = Dimensions.get('window');
    const containerWidth = screenWidth - 72; // Account for margins and padding (16 + 20 + 20 + 16)
    const defaultWidth = Math.min(containerWidth, 300);

    // Default configuration with responsive sizing
    const defaultConfig = {
        width: defaultWidth,
        height: 220,
        barWidth: Math.max(12, Math.min(16, containerWidth / 25)), // Dynamic bar width
        initialSpacing: 10,
        spacing: Math.max(8, containerWidth / 40), // Dynamic spacing
        barBorderRadius: 4,
        showGradient: true,
        isAnimated: true,
        animationDuration: 800,
        yAxisThickness: 0,
        xAxisType: 'dashed' as const,
        xAxisColor: theme === 'dark' ? '#666' : '#ccc',
        yAxisTextStyle: { color: theme === 'dark' ? '#ccc' : '#666', fontSize: 12 },
        xAxisLabelTextStyle: { color: theme === 'dark' ? '#ccc' : '#666', textAlign: 'center' as const },
        stepValue: 1000,
        maxValue: 6000,
        noOfSections: 6,
        yAxisLabelTexts: ['0', '1k', '2k', '3k', '4k', '5k', '6k'],
        labelWidth: 40,
        activeOpacity: 0.7,
        // Default line overlay configuration
        showLine: true,
        lineConfig: {
            color: '#FF9800',
            thickness: 3,
            curved: true,
            hideDataPoints: false,
            dataPointsColor: '#FF9800',
            dataPointsRadius: 4,
            shiftY: 20,
            initialSpacing: -30,
        },
    };

    // Merge default config with provided config
    const mergedConfig = { ...defaultConfig, ...config };

    const handleBarPress = (item: BarDataItem, index: number) => {
        // Trigger haptic feedback on mobile platforms
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Call the provided callback if available
        onBarPress?.(item, index);
    };

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

            <BarChart
                data={data}
                width={mergedConfig.width}
                height={mergedConfig.height}
                barWidth={mergedConfig.barWidth}
                initialSpacing={mergedConfig.initialSpacing}
                spacing={mergedConfig.spacing}
                barBorderRadius={mergedConfig.barBorderRadius}
                showGradient={mergedConfig.showGradient}
                isAnimated={mergedConfig.isAnimated}
                animationDuration={mergedConfig.animationDuration}
                isThreeD={mergedConfig.isThreeD}
                side={mergedConfig.side}
                sideWidth={mergedConfig.sideWidth}
                frontColor={mergedConfig.frontColor}
                sideColor={mergedConfig.sideColor}
                topColor={mergedConfig.topColor}
                gradientColor={mergedConfig.gradientColor}
                // Axis configuration
                yAxisThickness={mergedConfig.yAxisThickness}
                xAxisThickness={mergedConfig.xAxisThickness}
                xAxisType={mergedConfig.xAxisType}
                xAxisColor={mergedConfig.xAxisColor}
                yAxisColor={mergedConfig.yAxisColor}
                hideYAxisText={mergedConfig.hideYAxisText}
                yAxisTextStyle={mergedConfig.yAxisTextStyle}
                xAxisLabelTextStyle={mergedConfig.xAxisLabelTextStyle}
                stepValue={mergedConfig.stepValue}
                maxValue={mergedConfig.maxValue}
                noOfSections={mergedConfig.noOfSections}
                yAxisLabelTexts={mergedConfig.yAxisLabelTexts}
                labelWidth={mergedConfig.labelWidth}
                // Line overlay
                showLine={mergedConfig.showLine}
                lineConfig={mergedConfig.lineConfig}
                // Interaction
                onPress={handleBarPress}
                activeOpacity={mergedConfig.activeOpacity}
            />

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