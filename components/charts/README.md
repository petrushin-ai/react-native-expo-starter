# Chart Components - Victory Native XL Migration

This directory contains chart components that have been migrated from `react-native-gifted-charts` to **Victory Native XL** for better performance and more flexible customization.

## InteractiveBarChart

A performant, interactive bar chart component using Victory Native XL.

### Features

- ✨ High-performance rendering with React Native Skia
- 🎯 Interactive touch gestures with haptic feedback
- 🎨 Gradient support with customizable colors
- 📱 Responsive design that adapts to screen sizes
- 🌙 Dark/light theme support
- 🔤 Custom font support (uses SpaceMono-Regular.ttf)

### Usage

```tsx
import InteractiveBarChart from '@/components/charts/InteractiveBarChart';

const data = [
  { label: 'Jan', value: 1200 },
  { label: 'Feb', value: 1900 },
  { label: 'Mar', value: 800 },
  { label: 'Apr', value: 1500 },
  { label: 'May', value: 2200 },
  { label: 'Jun', value: 1700 },
];

export default function MyChart() {
  const handleBarPress = (item, index) => {
    console.log('Pressed bar:', item.label, item.value);
  };

  return (
    <InteractiveBarChart
      data={data}
      title="Monthly Sales"
      description="Sales data for the first half of the year"
      theme="light"
      onBarPress={handleBarPress}
      showSelectionInfo
      // Optional layout configuration
      padding={{ left: 15, right: 15, top: 40, bottom: 20 }}
      domainPadding={{ left: 10, right: 10, top: 50, bottom: 10 }}
      // Optional grid and axis configuration
      showGrid={true}
      showXAxis={true}
      showYAxis={true}
      showFrame={false}
      config={{
        height: 250,
        barColor: '#3B82F6',
        gradientColors: ['#3B82F6', '#3B82F650'],
        roundedCorners: {
          topLeft: 6,
          topRight: 6,
        },
        isAnimated: true,
        animationDuration: 800,
      }}
    />
  );
}
```

### Data Format

The component expects data in the following format:

```tsx
interface BarDataItem {
  label: string;      // x-axis label
  value: number;      // y-axis value
  originalIndex?: number;
  color?: string;     // Optional custom color
}
```

### Configuration Options

```tsx
interface InteractiveBarChartProps {
  data: BarDataItem[];
  config?: VictoryBarChartConfig;
  title?: string;
  description?: string;
  theme?: 'light' | 'dark';
  onBarPress?: (item: BarDataItem, index: number) => void;
  selectedIndex?: number | null;
  showSelectionInfo?: boolean;
  
  // Chart layout configuration
  padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
  domainPadding?: number | { left?: number; right?: number; top?: number; bottom?: number };
  
  // Grid display configuration
  showGrid?: boolean;        // Show coordinate grid lines
  showXAxis?: boolean;       // Show X-axis labels
  showYAxis?: boolean;       // Show Y-axis labels
  showFrame?: boolean;       // Show chart frame/border
  
  // Gradient and tooltip configuration
  gradientOpacity?: number;
  showTooltip?: boolean;
  tooltipConfig?: TooltipConfig;
}

interface VictoryBarChartConfig {
  height?: number;
  
  // Bar styling
  barColor?: string;
  gradientColors?: [string, string];
  roundedCorners?: {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
  };
  
  // Animation
  isAnimated?: boolean;
  animationDuration?: number;
  
  // Domain bounds
  domain?: { x?: [number, number]; y?: [number, number] };
}
```

### Layout and Grid Configuration

#### Padding and Domain Padding
- **`padding`**: Controls the space around the chart content within the container
- **`domainPadding`**: Controls the space between the chart bounds and the data points

```tsx
// Example: Custom spacing
<InteractiveBarChart
  data={data}
  padding={{ left: 20, right: 20, top: 40, bottom: 25 }}
  domainPadding={{ left: 15, right: 15, top: 60, bottom: 10 }}
/>
```

#### Grid and Axis Display
- **`showGrid`**: Display coordinate grid lines (default: false)
- **`showXAxis`**: Show X-axis labels (default: true)
- **`showYAxis`**: Show Y-axis labels (default: true)
- **`showFrame`**: Show chart border frame (default: false)

```tsx
// Example: Clean chart with grid
<InteractiveBarChart
  data={data}
  showGrid={true}
  showFrame={false}
  showXAxis={true}
  showYAxis={true}
/>
```

## GestureLineChart

A performant, interactive line chart component using Victory Native XL with smooth curves and area fills.

### Features

- ✨ Smooth line curves with customizable thickness
- 🌊 Area chart support with gradient fills
- 🎯 Interactive data point selection with haptic feedback
- 📱 Responsive design and gesture handling
- 🌙 Dark/light theme support
- 🎚️ Optional data points toggle

### Usage

```tsx
import GestureLineChart from '@/components/charts/GestureLineChart';

const lineData = [
  { label: 'Jan', value: 20 },
  { label: 'Feb', value: 45 },
  { label: 'Mar', value: 28 },
  { label: 'Apr', value: 80 },
  { label: 'May', value: 99 },
  { label: 'Jun', value: 43 },
];

export default function MyLineChart() {
  const handleDataPointPress = (item, index) => {
    console.log('Pressed point:', item.label, item.value);
  };

  return (
    <GestureLineChart
      data={lineData}
      title="Performance Trends"
      description="Area chart • Smooth curves • Interactive data points"
      theme="light"
      onDataPointPress={handleDataPointPress}
      showDataPointsToggle={true}
      initialShowDataPoints={true}
      showTooltip={true}
      // Optional layout configuration
      padding={{ left: 10, right: 10, top: 15, bottom: 15 }}
      domainPadding={{ left: 20, right: 20, top: 25, bottom: 5 }}
      // Optional grid and axis configuration
      showGrid={false}
      showXAxis={true}
      showYAxis={true}
      showFrame={false}
      config={{
        height: 220,
        curved: true,
        areaChart: true,
        thickness: 3,
        color1: '#2196F3',
        startFillColor: '#2196F3',
        endFillColor: 'rgba(33, 150, 243, 0.1)',
        isAnimated: true,
        animationDuration: 1000,
      }}
    />
  );
}
```

### Configuration Options

```tsx
interface GestureLineChartProps {
  data: LineDataItem[];
  config?: LineChartConfig;
  title?: string;
  description?: string;
  theme?: 'light' | 'dark';
  onDataPointPress?: (item: LineDataItem, index: number) => void;
  showDataPointsToggle?: boolean;
  initialShowDataPoints?: boolean;
  showTooltip?: boolean;
  
  // Chart layout configuration
  padding?: number | { left?: number; right?: number; top?: number; bottom?: number };
  domainPadding?: number | { left?: number; right?: number; top?: number; bottom?: number };
  
  // Grid display configuration
  showGrid?: boolean;        // Show coordinate grid lines
  showXAxis?: boolean;       // Show X-axis labels
  showYAxis?: boolean;       // Show Y-axis labels
  showFrame?: boolean;       // Show chart frame/border
}
```

## Migration from react-native-gifted-charts

### Key Changes

1. **Data Structure**: Simplified to `{ label: string, value: number }`
2. **Font Handling**: Uses `useFont` hook from React Native Skia
3. **Gradients**: Implemented with `LinearGradient` component from Skia
4. **Interactions**: Uses `useChartPressState` hook for touch handling
5. **Performance**: Leverages Skia rendering for smooth 60+ FPS animations

### Breaking Changes

- ❌ Removed: `frontColor`, `gradientColor`, `barWidth`, `spacing` props
- ❌ Removed: Complex axis configuration options
- ✅ Added: Simplified, performant API with better defaults
- ✅ Added: Built-in responsive behavior
- ✅ Added: Enhanced theming support

### Dependencies

The chart components require these peer dependencies:

```json
{
  "victory-native": "^41.17.4",
  "@shopify/react-native-skia": "^2.0.4",
  "react-native-reanimated": "~3.17.4",
  "react-native-gesture-handler": "~2.24.0"
}
```

## Performance

Victory Native XL provides significant performance improvements:

- **60+ FPS animations** even on low-end devices
- **Efficient rendering** using Skia graphics engine
- **Gesture handling** optimized for mobile interactions
- **Memory efficient** compared to SVG-based solutions 