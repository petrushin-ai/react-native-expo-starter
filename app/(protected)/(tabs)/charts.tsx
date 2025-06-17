import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useNavigation, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
    GestureLineChart,
    InteractiveBarChart,
    InteractiveRingChart,
    type BarChartConfig,
    type BarDataItem,
    type ChartTheme,
    type LegendItem,
    type LineChartConfig,
    type LineDataItem,
    type RingChartConfig,
    type RingDataItem
} from '@/components/charts';
import { Modal } from '@/components/ui/Modal';
import { useColorScheme } from '@/hooks/useColorScheme';

// Get screen dimensions for responsive charts
const { width: screenWidth } = Dimensions.get('window');
const chartContainerPadding = 40; // Total horizontal padding (20px each side)
const availableWidth = screenWidth - chartContainerPadding - 32; // Subtract container margins (16px each side)
const safeChartWidth = Math.min(availableWidth, 400); // Increased max width for 12 months

// Data generation utilities for Victory Native XL format
const generateBarChartData = (theme: ChartTheme): BarDataItem[] => {
    return [
        { label: 'Jan', value: 2800 },
        { label: 'Feb', value: 3200 },
        { label: 'Mar', value: 4200 },
        { label: 'Apr', value: 5400 },
        { label: 'May', value: 3900 },
        { label: 'Jun', value: 3600 },
        { label: 'Jul', value: 4100 },
        { label: 'Aug', value: 3800 },
        { label: 'Sep', value: 4500 },
        { label: 'Oct', value: 4800 },
        { label: 'Nov', value: 5200 },
        { label: 'Dec', value: 5600 },
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

const generateRingChartData = (): RingDataItem[] => [
    { label: 'Mobile', value: 45, color: '#3B82F6' },
    { label: 'Desktop', value: 35, color: '#10B981' },
    { label: 'Tablet', value: 15, color: '#F59E0B' },
    { label: 'Other', value: 5, color: '#EF4444' },
];

// Chart configuration factories for Victory Native XL
const createBarChartConfig = (theme: ChartTheme): BarChartConfig => ({
    height: 240,
    isAnimated: true,
    animationDuration: 1000,
    barColor: theme === 'dark' ? '#60A5FA' : '#3B82F6',
    gradientColors: [
        theme === 'dark' ? '#60A5FA' : '#3B82F6',
        theme === 'dark' ? '#60A5FA80' : '#3B82F680'
    ],
    roundedCorners: {
        topLeft: 6,
        topRight: 6,
    },
    // Minimal domain padding for maximum bar space
    domainPadding: { left: 18, right: 20, top: 25 },
    // Minimal padding that still shows all content
    padding: { left: 4, right: 8, top: 15, bottom: 15 },
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

const createRingChartConfig = (theme: ChartTheme): RingChartConfig => ({
    width: 300,
    height: 300,
    innerRadius: '45%',
    isAnimated: true,
    animationDuration: 1200,
    animateOnDataChange: true,
    onDataChangeAnimationDuration: 600,
    padAngle: 3,
    cornerRadius: 4,
    enableGradients: false,
    showLabels: false,
});

// Chart Card Wrapper Component
interface ChartCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    isDark: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children, isDark }) => (
    <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
        <Text style={[styles.chartTitle, isDark && styles.textDark]}>
            {title}
        </Text>
        <Text style={[styles.chartDescription, isDark && styles.textDark]}>
            {description}
        </Text>
        {children}
    </View>
);

export default function ChartsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const navigation = useNavigation();

    // Component refresh key - changing this will force a complete remount
    const [componentKey, setComponentKey] = useState(0);

    // Chart interaction state
    const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

    // Refresh and modal state
    const [refreshKey, setRefreshKey] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    // Generate data with theme awareness and refresh key for forcing regeneration
    const barData = useMemo(() => generateBarChartData(colorScheme), [colorScheme, refreshKey]);
    const lineData = useMemo(() => generateLineChartData(), [refreshKey]);
    const ringData = useMemo(() => generateRingChartData(), [refreshKey]);

    // Create configurations
    const barConfig = useMemo(() => createBarChartConfig(colorScheme), [colorScheme]);
    const lineConfig = useMemo(() => createLineChartConfig(colorScheme), [colorScheme]);
    const ringConfig = useMemo(() => createRingChartConfig(colorScheme), [colorScheme]);

    // Enhanced event handlers with real-time selection updates
    const handleBarPress = (item: BarDataItem, index: number) => {
        setSelectedBarIndex(index);
        console.log('Bar selected during drag:', item.label, item.value);
    };

    const handleLineDataPointPress = (item: LineDataItem, index: number) => {
        console.log('Line data point pressed:', item.label, item.value);
    };

    // Header handlers
    const handleRefresh = () => {
        // Force a complete component refresh by changing the key
        // This will unmount and remount the entire component
        setComponentKey(prev => prev + 1);
    };

    const handleInfo = () => {
        setModalVisible(true);
    };

    return (
        <React.Fragment key={componentKey}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Charts',
                    headerStyle: {
                        backgroundColor: isDark ? '#111827' : '#F9FAFB',
                    },
                    headerTintColor: isDark ? '#F9FAFB' : '#111827',
                    headerTitleStyle: {
                        fontWeight: '600',
                        fontSize: 18,
                    },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={handleRefresh}
                            style={styles.headerButton}
                        >
                            <Ionicons
                                name="refresh"
                                size={22}
                                color={isDark ? '#60A5FA' : '#3B82F6'}
                            />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleInfo}
                            style={styles.headerButton}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={22}
                                color={isDark ? '#60A5FA' : '#3B82F6'}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={isDark ? '#111827' : '#F9FAFB'}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.content}>
                    <View style={styles.welcomeSection}>
                        <Text style={[styles.title, isDark && styles.textDark]}>
                            Interactive Charts
                        </Text>
                        <Text style={[styles.subtitle, isDark && styles.textDark]}>
                            Victory Native XL • Performance • Gestures
                        </Text>
                    </View>

                    {/* Interactive Bar Chart with Enhanced Tooltips */}
                    <ChartCard
                        title="Sales Performance Dashboard"
                        description="Drag to see real-time selection • Enhanced tooltips • Currency formatting"
                        isDark={isDark}
                    >
                        <InteractiveBarChart
                            data={barData}
                            config={barConfig}
                            theme={colorScheme}
                            onBarPress={handleBarPress}
                            selectedIndex={selectedBarIndex}
                            showSelectionInfo={true}
                            showTooltip={true}
                            tooltipConfig={{
                                currencySymbol: '$',
                                currencyPosition: 'before',
                                backgroundColor: isDark ? '#1F2937' : '#3B82F6',
                                textColor: '#ffffff',
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: '600',
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                minWidth: 60,
                                autoHide: true,
                                autoHideDelay: 2500,
                            }}
                        />
                    </ChartCard>

                    {/* Gesture Line Chart */}
                    <ChartCard
                        title="Performance Trends"
                        description="Area chart • Default data points (4px) • Static tooltips"
                        isDark={isDark}
                    >
                        <GestureLineChart
                            data={lineData}
                            config={lineConfig}
                            theme={colorScheme}
                            onDataPointPress={handleLineDataPointPress}
                            showDataPointsToggle={true}
                            initialShowDataPoints={true}
                            interpolationType="natural"
                            dataPointSize={4}
                            showDataPointTooltip={true}
                        />
                    </ChartCard>

                    {/* Gesture Line Chart with Cardinal Interpolation */}
                    <ChartCard
                        title="Cardinal Interpolation Example"
                        description="Cardinal splines • Small data points (3px) • No static tooltips"
                        isDark={isDark}
                    >
                        <GestureLineChart
                            data={lineData}
                            config={{
                                ...lineConfig,
                                areaChart: false,
                                thickness: 3,
                                startFillColor: isDark ? '#F59E0B' : '#F59E0B',
                                endFillColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            }}
                            theme={colorScheme}
                            onDataPointPress={handleLineDataPointPress}
                            showDataPointsToggle={true}
                            initialShowDataPoints={false}
                            interpolationType="cardinal"
                            dataPointSize={3}
                            showDataPointTooltip={false}
                        />
                    </ChartCard>

                    {/* Gesture Line Chart with Step Interpolation */}
                    <ChartCard
                        title="Step Interpolation Example"
                        description="Step function • Large data points (6px) • Static tooltips"
                        isDark={isDark}
                    >
                        <GestureLineChart
                            data={lineData}
                            config={{
                                ...lineConfig,
                                areaChart: true,
                                thickness: 2,
                                startFillColor: isDark ? '#10B981' : '#10B981',
                                endFillColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            }}
                            theme={colorScheme}
                            onDataPointPress={handleLineDataPointPress}
                            showDataPointsToggle={true}
                            initialShowDataPoints={true}
                            interpolationType="step"
                            dataPointSize={6}
                            showDataPointTooltip={true}
                        />
                    </ChartCard>

                    {/* Gesture Line Chart with Linear Interpolation */}
                    <ChartCard
                        title="Linear Interpolation Example"
                        description="Straight lines • Extra large data points (8px) • No static tooltips"
                        isDark={isDark}
                    >
                        <GestureLineChart
                            data={lineData}
                            config={{
                                ...lineConfig,
                                areaChart: false,
                                thickness: 3,
                                startFillColor: isDark ? '#8B5CF6' : '#8B5CF6',
                                endFillColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                            }}
                            theme={colorScheme}
                            onDataPointPress={handleLineDataPointPress}
                            showDataPointsToggle={true}
                            initialShowDataPoints={false}
                            interpolationType="linear"
                            dataPointSize={8}
                            showDataPointTooltip={false}
                        />
                    </ChartCard>

                    {/* Interactive Ring Chart */}
                    <ChartCard
                        title="Device Usage Distribution"
                        description="Ring chart • Click legend to view details in center • Total shows all data"
                        isDark={isDark}
                    >
                        <InteractiveRingChart
                            data={ringData}
                            config={ringConfig}
                            theme={colorScheme}
                            showLegend={true}
                            showCenterValue={true}
                            centerValue="100%"
                            centerLabel="Total"
                            centerTextSize={24}
                            centerTextColor={isDark ? '#F9FAFB' : '#111827'}
                            enableAppearAnimation={true}
                            appearAnimationType="spring"
                            appearAnimationDuration={1200}
                            appearAnimationStagger={true}
                            appearAnimationStaggerDelay={150}
                            legendConfig={{
                                position: 'bottom',
                                showValues: true,
                                showPercentages: true,
                                fontSize: 14,
                                fontWeight: '500',
                                textColor: isDark ? '#F9FAFB' : '#374151',
                                highlightTextColor: isDark ? '#60A5FA' : '#3B82F6',
                                itemSpacing: 8,
                                rowSpacing: 12,
                                indicatorSize: 12,
                                indicatorShape: 'circle',
                            }}
                            onLegendItemPress={(item: LegendItem, index: number) => {
                                console.log('Ring chart legend item pressed:', item.label, item.value);
                            }}
                        />
                    </ChartCard>
                </View>
            </ScrollView>

            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Interactive Charts Showcase"
                message="This page demonstrates interactive chart components with gesture support, animations, and theme awareness. Features include multiple interpolation types (natural, cardinal, step, linear), configurable data point sizes (3px to 8px), static data point tooltips that hide during dragging, enhanced dynamic tooltips, real-time selection feedback, responsive design, individual data point toggles for line charts, and interactive ring charts with legend highlighting and center value display. Use the refresh button to regenerate data and each chart's toggle button to control static data points visibility."
                type="info"
                primaryButtonText="Got it"
                secondaryButtonText="Close"
            />
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    content: {
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    welcomeSection: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        textAlign: 'center',
    },
    textDark: {
        color: '#fff',
    },
    headerButton: {
        padding: 8,
    },
    chartCard: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chartCardDark: {
        backgroundColor: '#2d2d2d',
        borderColor: '#374151',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    chartDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
}); 