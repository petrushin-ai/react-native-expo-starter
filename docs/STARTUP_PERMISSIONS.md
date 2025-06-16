# Startup Permission System

This document describes the startup permission checking system that ensures all environment-defined permissions are requested at app launch and provides custom modals for when settings need to be opened.

## Overview

The startup permission system addresses several key issues:

1. **iOS Permission Status Sync**: Better detection of actual iOS notification permission status
2. **Proactive Permission Requests**: Ensures all environment-defined permissions are checked and requested at startup
3. **Custom Settings Modals**: Provides user-friendly modals directing users to settings when permissions need to be changed manually

## Components

### 1. PermissionModal (`components/ui/PermissionModal.tsx`)

A custom modal component that follows the existing app modal design pattern, specifically designed for permission-related prompts.

**Features:**
- Consistent with existing Modal component styling
- Orange accent color for settings/permissions theme
- Settings gear icon
- "Maybe Later" and "Open Settings" buttons
- Dark mode support

**Usage:**
```tsx
<PermissionModal
    visible={modal.visible}
    onClose={closeModal}
    title="Notifications Permission Required"
    message="This app needs notification permissions..."
    permissionType="Notifications"
    onOpenSettings={() => Linking.openURL('app-settings:')}
/>
```

### 2. useStartupPermissions Hook (`hooks/useStartupPermissions.ts`)

A comprehensive hook that manages the startup permission checking process.

**Key Features:**
- **Enhanced iOS Permission Detection**: Uses iOS-specific permission status checking
- **Automatic Startup Flow**: Runs when app launches with proper delays for context initialization
- **Smart Permission Requests**: Tries to request permissions first, only shows modal if needed
- **App State Integration**: Refreshes permissions when app comes to foreground
- **One-at-a-time Modals**: Shows one permission modal at a time to avoid overwhelming users

**Exported Functions:**
```tsx
const {
    permissionModal,        // Modal state data
    closePermissionModal,   // Close the modal
    handleOpenSettings,     // Open device settings
    recheckPermissions,     // Manually trigger permission check
    checkAllPermissionsStatus, // Get current status of all permissions
} = useStartupPermissions();
```

### 3. Enhanced NotificationContext (`contexts/NotificationContext.tsx`)

Improved iOS notification permission detection with better sync to system settings.

**iOS Improvements:**
- Uses `permissionResponse.ios?.status` for accurate iOS permission detection
- Maps iOS-specific statuses (`AUTHORIZED`, `PROVISIONAL`, `DENIED`) to simplified statuses
- Reduces polling frequency - only checks on app state changes on iOS
- Android continues with lighter polling (every 5 seconds instead of every 1 second)

### 4. Integration with Protected Layout (`app/(protected)/_layout.tsx`)

The permission system is integrated at the app level to ensure it runs when the app starts.

## Permission Flow

### 1. App Startup
1. After 1-second delay (to ensure contexts are initialized)
2. Refresh current permission states
3. Check all environment-defined permissions
4. For each non-granted permission:
   - Try to request permission programmatically
   - If not granted, check if we can ask again
   - If cannot ask again (iOS) or permission denied, show settings modal

### 2. iOS Permission Detection
- Uses enhanced iOS-specific permission checking
- Properly handles `PROVISIONAL` authorization
- Detects when `canAskAgain` is false
- Only shows settings modal when necessary

### 3. Settings Modal Flow
- Shows one modal at a time
- Provides clear explanation of why permission is needed
- Offers "Maybe Later" option for non-blocking UX
- "Open Settings" button uses platform-appropriate settings URLs

## Environment Configuration

Permissions are controlled via environment variables:

```bash
# Permissions Configuration
EXPO_PUBLIC_PERMISSIONS_NOTIFICATIONS=true
EXPO_PUBLIC_PERMISSIONS_LOCATION=true
```

The system automatically checks and requests any permission set to `true` in the environment.

## Usage in Settings Screen

The Settings screen has been updated to integrate with the new system:

- Removed frequent polling (now handled efficiently by contexts)
- Added "Recheck Permissions" button for manual permission checking
- Better error handling and user feedback
- Maintains debug functionality for development

## Platform Differences

### iOS
- Uses enhanced permission detection with iOS-specific status checking
- Only checks permissions on app state changes (more efficient)
- Properly handles `canAskAgain` status
- Uses `app-settings:` URL for settings

### Android
- Uses standard permission API
- Light polling every 5 seconds for permission changes
- Uses `Linking.openSettings()` for settings

## Testing

To test the permission system:

1. **Fresh Install**: Install app on device that hasn't had the app before
2. **Denied Permissions**: Deny permissions and verify settings modal appears
3. **Settings Changes**: Change permissions in device settings and verify app syncs
4. **Multiple Permissions**: Test with both notifications and location enabled
5. **Debug Mode**: Enable `EXPO_PUBLIC_PERMISSIONS_DEBUG=true` for additional controls

## Troubleshooting

### iOS Permission Status Not Syncing
- Ensure app is using enhanced iOS permission detection
- Check that app state change listeners are working
- Verify permission is actually changed in device settings

### Modal Not Appearing
- Check environment variables are set correctly
- Verify permissions are actually denied/restricted
- Ensure startup delay allows contexts to initialize

### Performance Issues
- iOS: Should only check on app state changes
- Android: Light polling every 5 seconds
- Settings screen: No automatic polling, manual refresh only

## Integration with Existing Code

The system is designed to work alongside existing permission code:

- Existing `usePermissions` and `useNotifications` hooks continue to work
- Settings screen functionality is preserved
- No breaking changes to existing permission flows
- Additional proactive permission checking at startup 