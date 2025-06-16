// Chart Data Types for Victory Native XL
export interface BarDataItem {
    label: string;      // x-axis value (string or number)
    value: number;      // y-axis value (must be number)
    // Additional metadata for interactions
    originalIndex?: number;
    color?: string;     // For custom bar colors
}

export interface LineDataItem {
    label: string;      // x-axis value
    value: number;      // y-axis value
    // Additional metadata
    originalIndex?: number;
}

export interface PieDataItem {
    value: number;
    color?: string;
    gradientCenterColor?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
    fontStyle?: 'normal' | 'italic';
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    focused?: boolean;
    pieInnerComponent?: () => React.ReactNode;
    labelPosition?: 'onBorder' | 'outward' | 'inward' | 'mid';
    onPress?: (item: PieDataItem, index: number) => void;
}

// Victory Native XL Chart Configuration Types
export interface VictoryBarChartConfig {
    // Chart dimensions and layout
    height?: number;
    padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
    domainPadding?: number | { left?: number; right?: number; top?: number; bottom?: number };

    // Bar styling
    barColor?: string;
    gradientColors?: [string, string];
    roundedCorners?: {
        topLeft?: number;
        topRight?: number;
        bottomLeft?: number;
        bottomRight?: number;
    };

    // Axis configuration for Victory Native XL
    xAxisConfig?: {
        font?: any; // SkFont from react-native-skia
        labelColor?: string;
        lineColor?: string;
        lineWidth?: number;
        tickCount?: number;
        formatXLabel?: (value: any) => string;
    };
    yAxisConfig?: {
        font?: any; // SkFont from react-native-skia
        labelColor?: string;
        lineColor?: string;
        lineWidth?: number;
        tickCount?: number;
        formatYLabel?: (value: any) => string;
    };

    // Animation
    isAnimated?: boolean;
    animationDuration?: number;

    // Domain bounds
    domain?: { x?: [number, number]; y?: [number, number] };
}

export interface LineChartConfig {
    width?: number;
    height?: number;
    spacing?: number;
    initialSpacing?: number;
    curved?: boolean;
    areaChart?: boolean;
    color1?: string;
    thickness?: number;
    hideDataPoints?: boolean;
    dataPointsColor?: string;
    dataPointsRadius?: number;
    textColor1?: string;
    textShiftY?: number;
    textShiftX?: number;
    textFontSize?: number;
    // Animations
    isAnimated?: boolean;
    animateOnDataChange?: boolean;
    animationDuration?: number;
    onDataChangeAnimationDuration?: number;
    // Area chart specific
    startFillColor?: string;
    endFillColor?: string;
    startOpacity?: number;
    endOpacity?: number;
    // Axes
    yAxisColor?: string;
    xAxisColor?: string;
    yAxisTextStyle?: object;
    xAxisLabelTextStyle?: object;
    showVerticalLines?: boolean;
    verticalLinesColor?: string;
    // Interaction
    onPress?: (item: LineDataItem, index: number) => void;
}

export interface PieChartConfig {
    donut?: boolean;
    radius?: number;
    innerRadius?: number;
    innerCircleColor?: string;
    showGradient?: boolean;
    sectionAutoFocus?: boolean;
    isAnimated?: boolean;
    animationDuration?: number;
    centerLabelComponent?: () => React.ReactNode;
    // Interaction
    onPress?: (item: PieDataItem, index: number) => void;
    // Styling
    strokeColor?: string;
    strokeWidth?: number;
    shadow?: boolean;
    shadowColor?: string;
}

// Component Props Types for Victory Native XL
export interface InteractiveBarChartProps {
    data: BarDataItem[];
    config?: VictoryBarChartConfig;
    title?: string;
    description?: string;
    theme?: 'light' | 'dark';
    onBarPress?: (item: BarDataItem, index: number) => void;
    selectedIndex?: number | null;
    showSelectionInfo?: boolean;
}

export interface GestureLineChartProps {
    data: LineDataItem[];
    config?: LineChartConfig;
    title?: string;
    description?: string;
    theme?: 'light' | 'dark';
    onDataPointPress?: (item: LineDataItem, index: number) => void;
    showDataPointsToggle?: boolean;
    initialShowDataPoints?: boolean;
}

export interface InteractivePieChartProps {
    data: PieDataItem[];
    config?: PieChartConfig;
    title?: string;
    description?: string;
    theme?: 'light' | 'dark';
    onSlicePress?: (item: PieDataItem, index: number) => void;
    selectedIndex?: number | null;
    showLegend?: boolean;
    centerLabel?: {
        selectedText?: string;
        selectedSubtext?: string;
        defaultSubtext?: string;
    };
}

// Legacy types for backward compatibility
export interface BarChartConfig extends VictoryBarChartConfig { }

// Common types
export type ChartTheme = 'light' | 'dark';

export interface ChartDimensions {
    width: number;
    height: number;
}

export interface ChartColors {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    border: string;
} 