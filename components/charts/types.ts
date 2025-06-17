// Chart Data Types for Victory Native XL

// Interpolation types available in Victory Native XL
export type InterpolationType =
    | 'linear'
    | 'natural'
    | 'bumpX'
    | 'bumpY'
    | 'cardinal'
    | 'cardinal50'
    | 'catmullRom'
    | 'catmullRom0'
    | 'catmullRom100'
    | 'step'
    | 'monotoneX'
    | 'basis';

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



// Victory Native XL Chart Configuration Types
export interface VictoryBarChartConfig {
    // Chart dimensions and layout
    height?: number;
    padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
    domainPadding?: number | { left?: number; right?: number; top?: number; bottom?: number };

    // Bar styling
    barColor?: string;
    gradientColors?: [string, string];
    gradientOpacity?: number; // 0-1, controls the transparency of the gradient end color
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
    interpolationType?: InterpolationType;
    areaChart?: boolean;
    color1?: string;
    thickness?: number;
    hideDataPoints?: boolean;
    dataPointsColor?: string;
    dataPointsRadius?: number;
    dataPointSize?: number;
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
    // Gradient configuration
    gradientOpacity?: number; // 0-1, controls the transparency of the gradient end color
    // Tooltip configuration
    showTooltip?: boolean;
    tooltipConfig?: {
        currencySymbol?: string;
        currencyPosition?: 'before' | 'after';
        formatValue?: (value: number) => string;
        backgroundColor?: string;
        textColor?: string;
        borderRadius?: number;
        fontSize?: number;
        fontWeight?: string;
        paddingHorizontal?: number;
        paddingVertical?: number;
        minWidth?: number;
        autoHide?: boolean;
        autoHideDelay?: number;
    };
    // Chart layout configuration
    padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
    domainPadding?: number | { left?: number; right?: number; top?: number; bottom?: number };
    // Grid display configuration
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showFrame?: boolean;
    // Appearing animation configuration
    enableAppearAnimation?: boolean; // Optional - enables chart appearing animation
    appearAnimationType?: 'timing' | 'spring'; // Optional - animation type
    appearAnimationDuration?: number; // Optional - animation duration in ms
    appearAnimationStagger?: boolean; // Optional - enables staggered appearance
    appearAnimationStaggerDelay?: number; // Optional - delay between staggered items in ms
    onAppearAnimationComplete?: () => void; // Optional - callback when animation completes
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
    showTooltip?: boolean;
    interpolationType?: InterpolationType;
    showStaticDataPoints?: boolean;
    dataPointSize?: number;
    showDataPointTooltip?: boolean;
    // Chart layout configuration
    padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
    domainPadding?: number | { left?: number; right?: number; top?: number; bottom?: number };
    // Grid display configuration
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showFrame?: boolean;
    // Appearing animation configuration
    enableAppearAnimation?: boolean; // Optional - enables chart appearing animation
    appearAnimationType?: 'timing' | 'spring'; // Optional - animation type
    appearAnimationDuration?: number; // Optional - animation duration in ms
    appearAnimationStagger?: boolean; // Optional - enables staggered appearance
    appearAnimationStaggerDelay?: number; // Optional - delay between staggered items in ms
    onAppearAnimationComplete?: () => void; // Optional - callback when animation completes
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