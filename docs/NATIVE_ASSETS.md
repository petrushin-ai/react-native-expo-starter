# Native Assets with expo-native-asset

This project includes `expo-native-asset` to bundle images directly into the iOS asset catalog, providing better performance and avoiding iOS PNG decoder issues.

## Why Use Native Assets?

1. **Avoid iOS PNG Decoder Bug**: iOS 17+ has a known bug with indexed color PNGs that can cause rendering issues
2. **Better Performance**: Images are available immediately at app launch
3. **No FONC**: Eliminates Flash of Native Content for navigation icons
4. **Smaller JS Bundle**: Images are not included in the JavaScript bundle

## Setup

The plugin is already configured in `app.json`:

```json
{
  "plugins": [
    [
      "expo-native-asset",
      {
        "assets": []
      }
    ]
  ]
}
```

## Adding Native Assets

### 1. Prepare Your Images

Create PNG images in three resolutions:
- `image.png` - 1x resolution
- `image@2x.png` - 2x resolution (recommended)
- `image@3x.png` - 3x resolution (recommended)

**Important**: Ensure your PNGs are NOT indexed color format to avoid iOS decoder issues.

To check if a PNG is indexed:
```bash
# Using ImageMagick
identify -verbose your-image.png | grep "Type:"
# Should show "Type: TrueColor" not "Type: Palette"
```

To convert indexed PNG to non-indexed:
```bash
# Using ImageMagick
convert input.png -define png:color-type=6 output.png

# Using pngcrush
pngcrush -rem alla -reduce input.png output.png
```

### 2. Add to Native Images Directory

Place your images in `assets/native-images/`:
```
assets/
  native-images/
    chevron-left.png
    chevron-left@2x.png
    chevron-left@3x.png
```

### 3. Update app.json

Add the asset to the plugin configuration:
```json
{
  "plugins": [
    [
      "expo-native-asset",
      {
        "assets": [
          {
            "type": "imageset",
            "path": "./assets/native-images/chevron-left.png"
          }
        ]
      }
    ]
  ]
}
```

### 4. Rebuild the App

After adding new assets, rebuild:
```bash
npx expo prebuild --clean
```

## Using Native Assets in Code

### Basic Usage

```tsx
import { Image } from 'react-native';

// On iOS, this loads from the native asset catalog
// The uri matches the filename without extension
<Image 
  source={{ uri: "chevron-left", width: 24, height: 24 }} 
  style={{ width: 24, height: 24 }}
/>
```

### With the NativeImage Component

Use our helper component for cross-platform support:

```tsx
import { NativeImage } from '@/components/ui/NativeImage';

<NativeImage
  nativeAssetName="chevron-left"
  fallbackSource={require('@/assets/images/chevron-left.png')}
  width={24}
  height={24}
/>
```

### With the useNativeAsset Hook

```tsx
import { useNativeAsset } from '@/hooks/useNativeAsset';
import { Image } from 'react-native';

const { source, dimensions } = useNativeAsset({
  nativeAssetName: 'chevron-left',
  fallbackSource: require('@/assets/images/chevron-left.png'),
  dimensions: { width: 24, height: 24 }
});

<Image source={source} style={dimensions} />
```

### For Navigation Headers

```tsx
import { Stack } from 'expo-router';

<Stack.Screen 
  name="details" 
  options={{
    headerBackImageSource: { 
      uri: "chevron-left", 
      width: 24, 
      height: 24 
    },
  }} 
/>
```

## Best Practices

1. **Always provide dimensions**: Native assets require width and height
2. **Use consistent naming**: Match your asset names across platforms
3. **Provide Android fallbacks**: Native assets only work on iOS
4. **Test on real devices**: Simulator may not show all issues
5. **Keep assets small**: Navigation icons should be ~24-32px
6. **Use non-indexed PNGs**: Avoid the iOS decoder bug

## Troubleshooting

### Asset not showing on iOS
- Ensure you've run `npx expo prebuild --clean`
- Check that the asset name in code matches the filename
- Verify the asset is listed in `app.json`

### PNG decoder warning
- Convert your PNGs to non-indexed format
- Use the conversion commands above

### Asset shows on iOS but not Android
- This is expected - provide a fallback source
- Use the `NativeImage` component or `useNativeAsset` hook

## Example Assets

Sample SVG assets are provided in `assets/native-images/`. To use them:

1. Convert SVGs to PNGs at proper resolutions
2. Add to `app.json` configuration
3. Rebuild the app

See `scripts/generate-sample-assets.js` for how the samples were created. 