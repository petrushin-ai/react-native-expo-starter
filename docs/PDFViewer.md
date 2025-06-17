# PDF Viewer Components

A comprehensive set of PDF viewing and downloading components for React Native Expo applications, based on the functionality from `@ReportsList.tsx`.

## Features

- 📱 **Cross-platform PDF viewing** using Google Docs viewer
- 📥 **File downloading** with platform-specific handling
- 🎨 **Theme-aware styling** that matches your design system
- 🔄 **Loading states** with proper feedback
- 📂 **Multiple viewing options** (buttons, icons, modals)
- ✅ **Comprehensive error handling**

## Components

### 1. PDFViewer (Main Component)

The primary component providing view and download buttons for PDF files.

```tsx
import PDFViewer from '@/components/ui/PDFViewer';

<PDFViewer
  url="https://example.com/document.pdf"
  title="Sample Document"
  showViewButton={true}
  showDownloadButton={true}
  onDownloadEnd={(success) => console.log('Download result:', success)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string \| null` | - | PDF URL to display and download |
| `title` | `string` | `'PDF Document'` | Title for the PDF document |
| `showViewButton` | `boolean` | `true` | Show view button |
| `showDownloadButton` | `boolean` | `true` | Show download button |
| `viewButtonText` | `string` | `'View PDF'` | Custom view button text |
| `downloadButtonText` | `string` | `'Download'` | Custom download button text |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Button variant for styling |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `style` | `ViewStyle` | - | Custom styles for the container |
| `onViewStart` | `() => void` | - | Callback when view is initiated |
| `onViewEnd` | `() => void` | - | Callback when view is completed |
| `onDownloadStart` | `() => void` | - | Callback when download is initiated |
| `onDownloadEnd` | `(success: boolean) => void` | - | Callback when download is completed |

### 2. PDFViewerModal

A modal wrapper that automatically opens PDF in WebBrowser when visible.

```tsx
import { PDFViewerModal } from '@/components/ui/PDFViewer';

<PDFViewerModal
  visible={showPDF}
  onClose={() => setShowPDF(false)}
  url="https://example.com/document.pdf"
  title="Sample Document"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | - | Whether the modal is visible |
| `onClose` | `() => void` | - | Callback to close the modal |
| `url` | `string \| null` | - | PDF URL to display |
| `title` | `string` | `'PDF Document'` | Title for the modal and PDF |

### 3. PDFActionButton

A compact icon button for PDF actions (view/download).

```tsx
import { PDFActionButton } from '@/components/ui/PDFViewer';

<PDFActionButton
  type="view"
  url="https://example.com/document.pdf"
  title="Sample Document"
  size={24}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'view' \| 'download'` | - | Type of action |
| `url` | `string \| null` | - | PDF URL |
| `title` | `string` | `'PDF Document'` | PDF title |
| `size` | `number` | `24` | Icon size |
| `color` | `string` | Theme color | Icon color |
| `style` | `ViewStyle` | - | Button style |
| `onStart` | `() => void` | - | Callback when action starts |
| `onEnd` | `(success?: boolean) => void` | - | Callback when action ends |

## File Download Utility

The components use a comprehensive file download utility (`@/utils/fileDownload.ts`) that handles:

- **Cross-platform downloading** (iOS/Android)
- **File system management** with proper directories
- **Media library integration** for Android
- **Native sharing dialogs**
- **Error handling and user feedback**

## Usage Examples

### Basic Usage

```tsx
// Simple PDF viewer with both buttons
<PDFViewer
  url="https://example.com/document.pdf"
  title="User Manual"
/>
```

### View Only

```tsx
// Only show view button
<PDFViewer
  url="https://example.com/document.pdf"
  title="Preview Document"
  showDownloadButton={false}
  variant="outline"
/>
```

### Download Only

```tsx
// Only show download button
<PDFViewer
  url="https://example.com/document.pdf"
  title="Form Template"
  showViewButton={false}
  downloadButtonText="Download Form"
  variant="secondary"
/>
```

### With Callbacks

```tsx
const [isProcessing, setIsProcessing] = useState(false);

<PDFViewer
  url="https://example.com/document.pdf"
  title="Report"
  onViewStart={() => setIsProcessing(true)}
  onViewEnd={() => setIsProcessing(false)}
  onDownloadStart={() => console.log('Starting download...')}
  onDownloadEnd={(success) => {
    if (success) {
      Alert.alert('Success', 'PDF downloaded successfully!');
    } else {
      Alert.alert('Error', 'Failed to download PDF');
    }
  }}
/>
```

### Compact Icon Buttons

```tsx
// For use in lists or compact layouts
<View style={{ flexDirection: 'row', gap: 12 }}>
  <PDFActionButton
    type="view"
    url="https://example.com/document.pdf"
    title="Document 1"
  />
  <PDFActionButton
    type="download"
    url="https://example.com/document.pdf"
    title="Document 1"
  />
</View>
```

### Modal Trigger

```tsx
const [showPDFModal, setShowPDFModal] = useState(false);

// Trigger button
<Button
  title="Open PDF"
  onPress={() => setShowPDFModal(true)}
/>

// Modal
<PDFViewerModal
  visible={showPDFModal}
  onClose={() => setShowPDFModal(false)}
  url="https://example.com/document.pdf"
  title="Important Document"
/>
```

## Styling

All components inherit from your app's design system and support both light and dark themes automatically. The styling matches your existing Button and Modal components.

### Custom Styling

```tsx
<PDFViewer
  url="https://example.com/document.pdf"
  style={{
    marginVertical: 16,
    paddingHorizontal: 20,
  }}
  variant="outline"
  size="large"
/>
```

## Platform Considerations

### iOS
- Uses native sharing dialog for downloads
- PDF opens in Safari with Google Docs viewer
- Smooth integration with iOS file system

### Android
- Saves files to Downloads folder
- Automatic sharing dialog after download
- Fallback to MediaLibrary if needed
- Intent launcher support for native PDF apps

## Dependencies

The components require these Expo modules:

```bash
npm install expo-file-system expo-sharing expo-media-library expo-intent-launcher expo-web-browser
```

## Error Handling

The components include comprehensive error handling:

- **Network errors** during download
- **Permission errors** for file system access
- **Invalid URLs** with user-friendly messages
- **Platform-specific fallbacks**

All errors are displayed to users via Alert dialogs with clear, actionable messages.

## Integration with Lists

Perfect for use in report lists, document libraries, or any list-based UI:

```tsx
// In a FlatList renderItem
const renderDocument = ({ item }) => (
  <View style={styles.listItem}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.date}>{item.date}</Text>
    <View style={styles.actions}>
      <PDFActionButton
        type="view"
        url={item.url}
        title={item.title}
      />
      <PDFActionButton
        type="download"
        url={item.url}
        title={item.title}
      />
    </View>
  </View>
);
```

This implementation provides the same functionality as seen in `@ReportsList.tsx` but as reusable, well-documented components that can be used throughout your application. 