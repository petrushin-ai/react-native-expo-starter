import * as Haptics from 'expo-haptics';
import React, { memo, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import type { InteractivePieChartProps, PieDataItem } from './types';

const InteractivePieChart: React.FC<InteractivePieChartProps> = ({
    data,
    config = {},
    title,
    description,
    theme = 'light',
    onSlicePress,
    selectedIndex,
    showLegend = true,
    centerLabel,
}) => {
    // Get responsive dimensions
    const { width: screenWidth } = Dimensions.get('window');
    const containerWidth = screenWidth - 72; // Account for margins and padding
    const maxRadius = Math.min(containerWidth * 0.35, 90); // Responsive radius

    // Default configuration with responsive sizing
    const defaultConfig = {
        donut: true,
        radius: maxRadius,
        innerRadius: maxRadius * 0.7, // Maintain proportion
        innerCircleColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        showGradient: true,
        sectionAutoFocus: true,
        isAnimated: true,
        animationDuration: 800,
        strokeColor: theme === 'dark' ? '#333' : '#fff',
        strokeWidth: 2,
        shadow: false,
    };

    // Merge default config with provided config
    const mergedConfig = { ...defaultConfig, ...config };

    // Process data to include focus state
    const processedData = useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            focused: index === selectedIndex,
        }));
    }, [data, selectedIndex]);

    const handleSlicePress = (item: PieDataItem, index: number) => {
        // Trigger haptic feedback on mobile platforms
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Call the provided callback if available
        onSlicePress?.(item, index);
    };

    const selectedItem = selectedIndex !== null && selectedIndex !== undefined ? data[selectedIndex] : null;

    // Center label component
    const centerLabelComponent = () => {
        if (!centerLabel) return null;

        const displayText = selectedItem
            ? centerLabel.selectedText || selectedItem.text
            : centerLabel.defaultText || 'Select';
        const displaySubtext = selectedItem
            ? centerLabel.selectedSubtext || 'Selected'
            : centerLabel.defaultSubtext || 'Tap slice';

        return (
            <ThemedView style={styles.centerLabel}>
                <ThemedText style={styles.centerLabelText}>{displayText}</ThemedText>
                <ThemedText style={styles.centerLabelSubtext}>{displaySubtext}</ThemedText>
            </ThemedView>
        );
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
        legend: {
            marginTop: 16,
            alignItems: 'flex-start',
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: Colors[theme].surface,
        },
        legendColorBox: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 8,
        },
        legendText: {
            fontSize: 12,
        },
        centerLabel: {
            alignItems: 'center',
        },
        centerLabelText: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        centerLabelSubtext: {
            fontSize: 10,
            opacity: 0.7,
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

            <PieChart
                data={processedData}
                donut={mergedConfig.donut}
                radius={mergedConfig.radius}
                innerRadius={mergedConfig.innerRadius}
                innerCircleColor={mergedConfig.innerCircleColor}
                showGradient={mergedConfig.showGradient}
                sectionAutoFocus={mergedConfig.sectionAutoFocus}
                isAnimated={mergedConfig.isAnimated}
                animationDuration={mergedConfig.animationDuration}
                strokeColor={mergedConfig.strokeColor}
                strokeWidth={mergedConfig.strokeWidth}
                shadow={mergedConfig.shadow}
                shadowColor={mergedConfig.shadowColor}
                centerLabelComponent={mergedConfig.centerLabelComponent || centerLabelComponent}
                onPress={mergedConfig.onPress || handleSlicePress}
            />

            {showLegend && (
                <ThemedView style={styles.legend}>
                    {data.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.legendItem}
                            onPress={() => handleSlicePress(item, index)}
                        >
                            <ThemedView
                                style={[styles.legendColorBox, { backgroundColor: item.color }]}
                            />
                            <ThemedText style={styles.legendText}>
                                Segment {index + 1}: {item.text || `${item.value}%`}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ThemedView>
            )}
        </ThemedView>
    );
};

export default memo(InteractivePieChart); 