/**
 * Script to generate sample assets for expo-native-asset demonstration
 * This creates simple chevron icons in different resolutions
 */

const fs = require('fs');
const path = require('path');

// Ensure the native-images directory exists
const nativeImagesDir = path.join(__dirname, '..', 'assets', 'native-images');
if (!fs.existsSync(nativeImagesDir)) {
    fs.mkdirSync(nativeImagesDir, { recursive: true });
}

// Create a simple SVG chevron
const createChevronSVG = (direction = 'left', size = 24) => {
    const points = direction === 'left'
        ? `${size * 0.7},${size * 0.2} ${size * 0.3},${size * 0.5} ${size * 0.7},${size * 0.8}`
        : `${size * 0.3},${size * 0.2} ${size * 0.7},${size * 0.5} ${size * 0.3},${size * 0.8}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <polyline points="${points}" 
    fill="none" 
    stroke="#007AFF" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"/>
</svg>`;
};

// Generate chevron-left icons
console.log('Generating sample chevron icons...');

// Note: In a real app, you would use proper image editing software
// to create PNG files. This is just for demonstration.
const chevronLeftSVG = createChevronSVG('left', 24);
const chevronRightSVG = createChevronSVG('right', 24);

// Save as SVG files (you would convert these to PNG in a real app)
fs.writeFileSync(
    path.join(nativeImagesDir, 'chevron-left.svg'),
    chevronLeftSVG
);

fs.writeFileSync(
    path.join(nativeImagesDir, 'chevron-right.svg'),
    chevronRightSVG
);

// Create a sample app logo
const appLogoSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="24" fill="#007AFF"/>
  <text x="60" y="75" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">RN</text>
</svg>`;

fs.writeFileSync(
    path.join(nativeImagesDir, 'app-logo.svg'),
    appLogoSVG
);

console.log(`
Sample assets created in ${nativeImagesDir}:
- chevron-left.svg
- chevron-right.svg  
- app-logo.svg

Note: In a real app, you would:
1. Convert these SVGs to PNG format with proper resolutions:
   - image.png (1x)
   - image@2x.png (2x) 
   - image@3x.png (3x)
2. Ensure PNGs are NOT indexed color to avoid iOS decoder issues
3. Add them to app.json's expo-native-asset configuration
4. Run 'npx expo prebuild --clean' to bundle them natively

To convert SVG to PNG, you can use tools like:
- ImageMagick: convert -density 300 chevron-left.svg chevron-left.png
- Online converters: svgtopng.com
- Design tools: Figma, Sketch, Adobe Illustrator
`); 