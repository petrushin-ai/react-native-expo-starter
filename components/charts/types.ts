// Chart Data Types
export interface BarDataItem {
    value: number;
    label?: string;
    frontColor?: string;
    gradientColor?: string;
    sideColor?: string;
    topColor?: string;
    spacing?: number;
    labelTextStyle?: object;
    labelComponent?: () => React.ReactNode;
    topLabelComponent?: () => React.ReactNode;
    barWidth?: number;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
}

export interface LineDataItem {
    value: number;
    label?: string;
    labelTextStyle?: object;
    dataPointText?: string;
    dataPointLabelComponent?: () => React.ReactNode;
    dataPointHeight?: number;
    dataPointWidth?: number;
    dataPointColor?: string;
    dataPointRadius?: number;
    hideDataPoint?: boolean;
    textShiftX?: number;
    textShiftY?: number;
    textColor?: string;
    textFontSize?: number;
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

// Chart Configuration Types
export interface LineConfig {
    color?: string;
    thickness?: number;
    curved?: boolean;
    hideDataPoints?: boolean;
    dataPointsColor?: string;
    dataPointsRadius?: number;
    shiftY?: number;
    initialSpacing?: number;
    animateOnDataChange?: boolean;
    animationDuration?: number;
}

export interface BarChartConfig {
    width?: number;
    height?: number;
    barWidth?: number;
    spacing?: number;
    initialSpacing?: number;
    showGradient?: boolean;
    isAnimated?: boolean;
    animationDuration?: number;
    barBorderRadius?: number;
    isThreeD?: boolean;
    side?: 'left' | 'right';
    sideWidth?: number;
    frontColor?: string;
    sideColor?: string;
    topColor?: string;
    gradientColor?: string;
    // Axis props
    yAxisThickness?: number;
    xAxisThickness?: number;
    xAxisType?: 'solid' | 'dashed' | 'dotted';
    xAxisColor?: string;
    yAxisColor?: string;
    hideYAxisText?: boolean;
    yAxisTextStyle?: object;
    xAxisLabelTextStyle?: object;
    stepValue?: number;
    maxValue?: number;
    noOfSections?: number;
    yAxisLabelTexts?: string[];
    labelWidth?: number;
    // Line overlay
    showLine?: boolean;
    lineConfig?: LineConfig;
    // Interaction
    onPress?: (item: BarDataItem, index: number) => void;
    activeOpacity?: number;
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

// Component Props Types
export interface InteractiveBarChartProps {
    data: BarDataItem[];
    config?: BarChartConfig;
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
        defaultText?: string;
        selectedSubtext?: string;
        defaultSubtext?: string;
    };
}

// Theme Types
export type ChartTheme = 'light' | 'dark';

// Utility Types
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