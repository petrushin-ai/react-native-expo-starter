import * as Haptics from 'expo-haptics';
import React, { memo, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import type { GestureLineChartProps, LineDataItem } from './types';

const GestureLineChart: React.FC<GestureLineChartProps> = ({
    data,
    config = {},
    title,
    description,
    theme = 'light',
    onDataPointPress,
    showDataPointsToggle = true,
    initialShowDataPoints = true,
}) => {
    const [showDataPoints, setShowDataPoints] = useState(initialShowDataPoints);

    // Get responsive dimensions
    const { width: screenWidth } = Dimensions.get('window');
    const containerWidth = screenWidth - 72; // Account for margins and padding
    const defaultWidth = Math.min(containerWidth, 300);

    // Default configuration with responsive sizing
    const defaultConfig = {
        width: defaultWidth,
        height: 220,
        spacing: Math.max(20, containerWidth / 12), // Dynamic spacing
        initialSpacing: 20,
        curved: true,
        areaChart: true,
        color1: theme === 'dark' ? '#4FC3F7' : '#2196F3',
        thickness: 3,
        hideDataPoints: false,
        dataPointsColor: theme === 'dark' ? '#4FC3F7' : '#2196F3',
        dataPointsRadius: 6,
        textColor1: theme === 'dark' ? '#ccc' : '#666',
        textShiftY: -8,
        textShiftX: -5,
        textFontSize: 12,
        // Animation settings
        isAnimated: true,
        animateOnDataChange: true,
        animationDuration: 1000,
        onDataChangeAnimationDuration: 300,
        // Area chart styling
        startFillColor: theme === 'dark' ? '#4FC3F7' : '#2196F3',
        endFillColor: theme === 'dark' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(33, 150, 243, 0.1)',
        startOpacity: 0.8,
        endOpacity: 0.3,
        // Axes styling
        yAxisColor: theme === 'dark' ? '#444' : '#ddd',
        xAxisColor: theme === 'dark' ? '#444' : '#ddd',
        yAxisTextStyle: { color: theme === 'dark' ? '#ccc' : '#666' },
        xAxisLabelTextStyle: { color: theme === 'dark' ? '#ccc' : '#666' },
        showVerticalLines: true,
        verticalLinesColor: theme === 'dark' ? '#333' : '#f0f0f0',
    };

    // Merge default config with provided config
    const mergedConfig = { ...defaultConfig, ...config };

    // Override hideDataPoints based on local state
    const finalConfig = {
        ...mergedConfig,
        hideDataPoints: !showDataPoints,
    };

    const handleDataPointPress = (item: LineDataItem, index: number) => {
        // Trigger haptic feedback on mobile platforms
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Call the provided callback if available
        onDataPointPress?.(item, index);
    };

    const handleToggleDataPoints = () => {
        setShowDataPoints(!showDataPoints);
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
    };

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

            <LineChart
                data={data}
                width={finalConfig.width}
                height={finalConfig.height}
                spacing={finalConfig.spacing}
                initialSpacing={finalConfig.initialSpacing}
                curved={finalConfig.curved}
                areaChart={finalConfig.areaChart}
                color1={finalConfig.color1}
                thickness={finalConfig.thickness}
                hideDataPoints={finalConfig.hideDataPoints}
                dataPointsColor={finalConfig.dataPointsColor}
                dataPointsRadius={finalConfig.dataPointsRadius}
                textColor1={finalConfig.textColor1}
                textShiftY={finalConfig.textShiftY}
                textShiftX={finalConfig.textShiftX}
                textFontSize={finalConfig.textFontSize}
                // Animation properties
                isAnimated={finalConfig.isAnimated}
                animateOnDataChange={finalConfig.animateOnDataChange}
                animationDuration={finalConfig.animationDuration}
                onDataChangeAnimationDuration={finalConfig.onDataChangeAnimationDuration}
                // Area chart properties
                startFillColor={finalConfig.startFillColor}
                endFillColor={finalConfig.endFillColor}
                startOpacity={finalConfig.startOpacity}
                endOpacity={finalConfig.endOpacity}
                // Axes properties
                yAxisColor={finalConfig.yAxisColor}
                xAxisColor={finalConfig.xAxisColor}
                yAxisTextStyle={finalConfig.yAxisTextStyle}
                xAxisLabelTextStyle={finalConfig.xAxisLabelTextStyle}
                showVerticalLines={finalConfig.showVerticalLines}
                verticalLinesColor={finalConfig.verticalLinesColor}
                // Interaction
                onPress={finalConfig.onPress || handleDataPointPress}
            />
        </ThemedView>
    );
};

export default memo(GestureLineChart); 