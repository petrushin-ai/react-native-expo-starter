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
interface VictoryBarChartConfig {
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
  
  // Axis configuration
  xAxisConfig?: {
    font?: SkFont;
    labelColor?: string;
    lineColor?: string;
    lineWidth?: number;
    formatXLabel?: (value: any) => string;
  };
  yAxisConfig?: {
    font?: SkFont;
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