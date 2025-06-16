import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, useColorScheme } from 'react-native';

import {
    GestureLineChart,
    InteractiveBarChart,
    InteractivePieChart,
    SimpleLineChart,
    type BarChartConfig,
    type BarDataItem,
    type ChartTheme,
    type LineChartConfig,
    type LineDataItem,
    type PieChartConfig,
    type PieDataItem
} from '@/components/charts';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Get screen dimensions for responsive charts
const { width: screenWidth } = Dimensions.get('window');
const chartContainerPadding = 40; // Total horizontal padding (20px each side)
const availableWidth = screenWidth - chartContainerPadding - 32; // Subtract container margins (16px each side)
const safeChartWidth = Math.min(availableWidth, 320); // Conservative max width

// Data generation utilities (outside components)
const generateBarChartData = (theme: ChartTheme): BarDataItem[] => {
    const primaryColor = theme === 'dark' ? '#4FC3F7' : '#2196F3';
    const secondaryColor = theme === 'dark' ? '#81C784' : '#4CAF50';

    return [
        { value: 2500, frontColor: primaryColor, gradientColor: '#E3F2FD', spacing: 6, label: 'Jan' },
        { value: 2400, frontColor: secondaryColor, gradientColor: '#E8F5E8' },
        { value: 3500, frontColor: primaryColor, gradientColor: '#E3F2FD', spacing: 6, label: 'Feb' },
        { value: 3000, frontColor: secondaryColor, gradientColor: '#E8F5E8' },
        { value: 4500, frontColor: primaryColor, gradientColor: '#E3F2FD', spacing: 6, label: 'Mar' },
        { value: 4000, frontColor: secondaryColor, gradientColor: '#E8F5E8' },
        { value: 5200, frontColor: primaryColor, gradientColor: '#E3F2FD', spacing: 6, label: 'Apr' },
        { value: 4900, frontColor: secondaryColor, gradientColor: '#E8F5E8' },
        { value: 3800, frontColor: primaryColor, gradientColor: '#E3F2FD', spacing: 6, label: 'May' },
        { value: 3600, frontColor: secondaryColor, gradientColor: '#E8F5E8' },
    ];
};

const generateLineChartData = (): LineDataItem[] => [
    { value: 20, label: 'Jan' },
    { value: 45, label: 'Feb' },
    { value: 28, label: 'Mar' },
    { value: 80, label: 'Apr' },
    { value: 99, label: 'May' },
    { value: 43, label: 'Jun' },
    { value: 85, label: 'Jul' },
    { value: 62, label: 'Aug' },
    { value: 78, label: 'Sep' },
    { value: 95, label: 'Oct' },
];

const generatePieChartData = (theme: ChartTheme): PieDataItem[] => {
    const colors = theme === 'dark'
        ? ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
        : ['#F44336', '#009688', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0', '#00BCD4', '#FFEB3B', '#673AB7', '#03A9F4'];

    return [
        { value: 18, color: colors[0], text: '18%' },
        { value: 15, color: colors[1], text: '15%' },
        { value: 12, color: colors[2], text: '12%' },
        { value: 10, color: colors[3], text: '10%' },
        { value: 9, color: colors[4], text: '9%' },
        { value: 8, color: colors[5], text: '8%' },
        { value: 7, color: colors[6], text: '7%' },
        { value: 6, color: colors[7], text: '6%' },
        { value: 8, color: colors[8], text: '8%' },
        { value: 7, color: colors[9], text: '7%' },
    ];
};

// Chart configuration factories
const createBarChartConfig = (theme: ChartTheme): BarChartConfig => ({
    width: safeChartWidth,
    height: 240,
    isAnimated: true,
    animationDuration: 1000,
    showGradient: true,
    showLine: true,
    lineConfig: {
        color: '#FF9800',
        thickness: 3,
        curved: true,
        hideDataPoints: false,
        dataPointsColor: '#FF9800',
        dataPointsRadius: 5,
        shiftY: 20,
        initialSpacing: -30,
    },
    // Custom 3D effect configuration
    isThreeD: false,
    barBorderRadius: 6,
});

const createLineChartConfig = (theme: ChartTheme): LineChartConfig => ({
    width: safeChartWidth,
    height: 240,
    isAnimated: true,
    animationDuration: 1200,
    animateOnDataChange: true,
    onDataChangeAnimationDuration: 400,
    curved: true,
    areaChart: true,
    thickness: 4,
    dataPointsRadius: 7,
    startOpacity: 0.9,
    endOpacity: 0.2,
    spacing: Math.max(18, (safeChartWidth - 60) / 10), // Dynamic spacing based on safe width
});

const createPieChartConfig = (theme: ChartTheme): PieChartConfig => {
    const maxRadius = Math.min(safeChartWidth * 0.28, 85); // Scale radius based on safe width
    return {
        radius: maxRadius,
        innerRadius: maxRadius * 0.68, // Maintain proportion
        isAnimated: true,
        animationDuration: 1000,
        sectionAutoFocus: true,
        shadow: true,
        shadowColor: theme === 'dark' ? '#000' : '#999',
    };
};

export default function ChartsScreen() {
    const colorScheme = useColorScheme();
    const theme: ChartTheme = colorScheme ?? 'light';

    // Chart interaction state
    const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
    const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(0);

    // Generate data with theme awareness
    const barData = useMemo(() => generateBarChartData(theme), [theme]);
    const lineData = useMemo(() => generateLineChartData(), []);
    const pieData = useMemo(() => generatePieChartData(theme), [theme]);

    // Create configurations
    const barConfig = useMemo(() => createBarChartConfig(theme), [theme]);
    const lineConfig = useMemo(() => createLineChartConfig(theme), [theme]);
    const pieConfig = useMemo(() => createPieChartConfig(theme), [theme]);

    // Event handlers
    const handleBarPress = (item: BarDataItem, index: number) => {
        setSelectedBarIndex(index);
        console.log('Bar pressed:', item.label, item.value);
    };

    const handleLineDataPointPress = (item: LineDataItem, index: number) => {
        console.log('Line data point pressed:', item.label, item.value);
    };

    const handlePieSlicePress = (item: PieDataItem, index: number) => {
        setSelectedPieIndex(index);
        console.log('Pie slice pressed:', item.text, item.value);
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Interactive Charts 2025
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Modular • Customizable • Gesture-enabled
                </ThemedText>
            </ThemedView>

            {/* Interactive Bar Chart */}
            <InteractiveBarChart
                data={barData}
                config={barConfig}
                title="Sales Performance Dashboard"
                description="Touch bars to see values • Animated gradients • Line overlay"
                theme={theme}
                onBarPress={handleBarPress}
                selectedIndex={selectedBarIndex}
                showSelectionInfo={true}
            />

            {/* Gesture Line Chart */}
            <GestureLineChart
                data={lineData}
                config={lineConfig}
                title="Performance Trends"
                description="Area chart • Smooth curves • Interactive data points"
                theme={theme}
                onDataPointPress={handleLineDataPointPress}
                showDataPointsToggle={true}
                initialShowDataPoints={true}
            />

            {/* Interactive Pie Chart */}
            <InteractivePieChart
                data={pieData}
                config={pieConfig}
                title="Market Distribution"
                description="Donut chart • Touch selection • Animated focus"
                theme={theme}
                onSlicePress={handlePieSlicePress}
                selectedIndex={selectedPieIndex}
                showLegend={true}
                centerLabel={{
                    selectedText: pieData[selectedPieIndex || 0]?.text || 'Select',
                    defaultText: 'Tap slice',
                    selectedSubtext: 'Market Share',
                    defaultSubtext: 'to select',
                }}
            />

            {/* Simple Line Chart */}
            <SimpleLineChart
                data={lineData}
                title="Simple Line Chart"
                description="No area fill • Straight lines • Clean design"
                theme={theme}
                onDataPointPress={(item: LineDataItem, index: number) => {
                    console.log('Simple line data point pressed:', item.label, item.value);
                }}
            />


        </ScrollView>
    );
}

const styles = {
    header: {
        padding: 20,
        alignItems: 'center' as const,
    },
    title: {
        textAlign: 'center' as const,
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center' as const,
        opacity: 0.7,
        fontSize: 14,
    },


}; 