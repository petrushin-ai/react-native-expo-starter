# Native Image Assets

This directory contains images that will be bundled natively in the iOS asset catalog using `expo-native-asset`.

## Why use native assets?

1. **Avoid iOS PNG decoder issues**: Native assets bypass the iOS ImageIO PNG decoder bug with indexed color PNGs
2. **Better performance**: Images are available immediately at app launch
3. **No FONC (Flash of Native Content)**: Especially useful for navigation icons

## How to add images

1. Add your images to this directory with appropriate resolutions:
   - `image.png` - 1x resolution
   - `image@2x.png` - 2x resolution (recommended)
   - `image@3x.png` - 3x resolution (recommended)

2. Update `app.json` to include the new asset:
   ```json
   {
     "plugins": [
       [
         "expo-native-asset",
         {
           "assets": [
             {
               "type": "imageset",
               "path": "./assets/native-images/your-image.png"
             }
           ]
         }
       ]
     ]
   }
   ```

3. Use the image in your code:
   ```tsx
   // For navigation back button
   <Stack
     screenOptions={{
       headerBackImageSource: { uri: "your-image", width: 20, height: 20 },
     }}
   />
   
   // For regular images
   <Image source={{ uri: "your-image" }} style={{ width: 50, height: 50 }} />
   ```

## Example assets

- `chevron-left.png` - Custom back button for navigation
- `app-logo.png` - App logo that needs to be available immediately

## Important notes

- The plugin automatically picks up @2x and @3x files if they exist
- After adding new assets, you need to rebuild the app (`npx expo prebuild --clean`)
- This only affects iOS; Android will use the regular asset system 