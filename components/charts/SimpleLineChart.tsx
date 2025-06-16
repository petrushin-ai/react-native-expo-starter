import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import type { GestureLineChartProps, LineDataItem } from './types';

interface SimpleLineChartProps extends Omit<GestureLineChartProps, 'showDataPointsToggle' | 'initialShowDataPoints'> {
    // Simple line chart specific props can be added here
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
    data,
    config = {},
    title,
    description,
    theme = 'light',
    onDataPointPress,
}) => {
    // Get responsive dimensions
    const { width: screenWidth } = Dimensions.get('window');
    const containerWidth = screenWidth - 72; // Account for margins and padding
    const defaultWidth = Math.min(containerWidth, 300);

    // Default configuration for simple line charts (no area fill, straight lines)
    const defaultConfig = {
        width: defaultWidth,
        height: 240,
        spacing: Math.max(25, containerWidth / 12), // Dynamic spacing
        initialSpacing: 20,
        curved: false,          // Straight lines by default
        areaChart: false,       // No area fill by default
        color1: theme === 'dark' ? '#FFC107' : '#FF9800',
        thickness: 2,
        hideDataPoints: false,
        dataPointsColor: theme === 'dark' ? '#FFC107' : '#FF9800',
        dataPointsRadius: 5,
        textColor1: theme === 'dark' ? '#ccc' : '#666',
        textShiftY: -8,
        textShiftX: -5,
        textFontSize: 12,
        // Animation settings
        isAnimated: true,
        animateOnDataChange: true,
        animationDuration: 800,
        onDataChangeAnimationDuration: 300,
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

    const handleDataPointPress = (item: LineDataItem, index: number) => {
        // Trigger haptic feedback on mobile platforms
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Call the provided callback if available
        onDataPointPress?.(item, index);
    };

    const styles = {
        container: {
            margin: 16,
            padding: 20,
            borderRadius: 16,
            backgroundColor: Colors[theme].card,
            alignItems: 'center' as const,
        },
        title: {
            marginBottom: 4,
            textAlign: 'center' as const,
        },
        description: {
            marginBottom: 16,
            textAlign: 'center' as const,
            opacity: 0.7,
            fontSize: 12,
        },
    };

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

            <LineChart
                data={data}
                width={mergedConfig.width}
                height={mergedConfig.height}
                spacing={mergedConfig.spacing}
                initialSpacing={mergedConfig.initialSpacing}
                curved={mergedConfig.curved}
                areaChart={mergedConfig.areaChart}
                color1={mergedConfig.color1}
                thickness={mergedConfig.thickness}
                hideDataPoints={mergedConfig.hideDataPoints}
                dataPointsColor={mergedConfig.dataPointsColor}
                dataPointsRadius={mergedConfig.dataPointsRadius}
                textColor1={mergedConfig.textColor1}
                textShiftY={mergedConfig.textShiftY}
                textShiftX={mergedConfig.textShiftX}
                textFontSize={mergedConfig.textFontSize}
                // Animation properties
                isAnimated={mergedConfig.isAnimated}
                animateOnDataChange={mergedConfig.animateOnDataChange}
                animationDuration={mergedConfig.animationDuration}
                onDataChangeAnimationDuration={mergedConfig.onDataChangeAnimationDuration}
                // Area chart properties (typically disabled for simple charts)
                startFillColor={mergedConfig.startFillColor}
                endFillColor={mergedConfig.endFillColor}
                startOpacity={mergedConfig.startOpacity}
                endOpacity={mergedConfig.endOpacity}
                // Axes properties
                yAxisColor={mergedConfig.yAxisColor}
                xAxisColor={mergedConfig.xAxisColor}
                yAxisTextStyle={mergedConfig.yAxisTextStyle}
                xAxisLabelTextStyle={mergedConfig.xAxisLabelTextStyle}
                showVerticalLines={mergedConfig.showVerticalLines}
                verticalLinesColor={mergedConfig.verticalLinesColor}
                // Interaction
                onPress={mergedConfig.onPress || handleDataPointPress}
            />
        </ThemedView>
    );
};

export default memo(SimpleLineChart); 