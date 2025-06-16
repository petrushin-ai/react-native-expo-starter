# Push Notifications

This app includes push notification support using Expo Push Notifications service.

## Overview

Push notifications are implemented using:
- `expo-notifications` - Core notification functionality
- `expo-device` - Device information for push tokens
- Expo Push Service - For sending notifications

## Configuration

### Environment Variables

Set your Expo project ID in the environment:
```bash
EXPO_PROJECT_ID=your-project-id
```

You can find your project ID in:
- Expo dashboard
- `app.json` after running `eas init`
- EAS configuration files

### App Configuration

The app is pre-configured with:
- iOS notification permissions prompt
- Android notification channels
- Notification handler for foreground notifications
- Interactive notification categories

## Features

### 1. Push Token Management
- Automatic token registration on app launch
- Expo Push Token for use with Expo Push Service
- Native device token for direct FCM/APNs integration

### 2. Permission Handling
- Automatic permission request flow
- Settings integration for managing permissions
- Graceful handling of denied permissions

### 3. Notification Types
- Local notifications (in-app)
- Remote push notifications
- Interactive notifications with actions
- Scheduled notifications

### 4. Notification Channels (Android)
- Default channel for general notifications
- Alerts channel for important notifications
- Reminders channel for scheduled reminders

## Usage

### Access Notifications in Components

```tsx
import { useNotificationContext } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    expoPushToken,
    requestPermissions,
    sendTestNotification,
    scheduleNotification 
  } = useNotificationContext();

  // Request permissions
  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      console.log('Notifications enabled!');
    }
  };

  // Schedule a notification
  const handleSchedule = async () => {
    await scheduleNotification(
      'Reminder',
      'Don\'t forget to check the app!',
      { customData: 'value' },
      60 // seconds
    );
  };
}
```

### Send Push Notifications

Use the Expo Push Service to send notifications:

```bash
curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/send" -d '{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Hello!",
  "body": "This is a test notification",
  "data": { "customKey": "customValue" }
}'
```

Or use the Expo Push Notification Tool:
https://expo.dev/notifications

### Handle Notification Responses

The app automatically handles notification interactions:

```tsx
// In useNotifications hook
responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  console.log('User interacted with notification:', response);
  // Handle navigation or actions based on response
});
```

## Testing

### Local Development

1. **Physical Device Required**: Push notifications don't work on simulators/emulators
2. **Development Build**: For Android SDK 53+, you need a development build
3. **Test Notifications**: Use the "Send Test Notification" button in Settings

### Test Checklist

- [ ] Permission request flow works
- [ ] Push token is generated successfully
- [ ] Test notification is received
- [ ] Notification appears when app is in foreground
- [ ] Notification appears when app is in background
- [ ] Tapping notification opens the app
- [ ] Interactive actions work (if implemented)

## Troubleshooting

### Token Not Generated

1. Check if running on physical device
2. Verify EXPO_PROJECT_ID is set
3. Check internet connectivity
4. Review console logs for errors

### Notifications Not Received

1. Verify permissions are granted
2. Check if token is valid
3. Ensure notification handler is set
4. For Android: Check notification channel settings
5. For iOS: Check notification settings in device

### Android Specific Issues

- Ensure notification channels are created
- Check if notifications are enabled for the app
- Verify google-services.json is configured (for FCM)

### iOS Specific Issues

- Check provisioning profile includes push notifications
- Verify APNs configuration
- Ensure notification permissions are granted

## Best Practices

1. **Request Permissions Thoughtfully**
   - Explain why you need notifications
   - Request at appropriate time (not immediately on launch)
   - Handle rejection gracefully

2. **Use Appropriate Channels**
   - Critical alerts: High importance
   - Regular updates: Default importance
   - Non-urgent: Low importance

3. **Notification Content**
   - Keep titles short and descriptive
   - Body text should be actionable
   - Use data payload for app-specific information

4. **Handle All States**
   - App in foreground
   - App in background
   - App closed
   - Notification dismissed

## Security Considerations

1. **Token Security**
   - Never expose push tokens in logs in production
   - Secure token transmission to your backend
   - Implement token refresh mechanism

2. **Data Payload**
   - Don't include sensitive data in notifications
   - Use notification ID to fetch data from secure API
   - Validate all notification data

## Advanced Features

### Custom Notification Sounds
Add sound files to `assets/sounds/` and configure in `app.json`:
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", {
        "sounds": ["notification.wav", "alert.wav"]
      }]
    ]
  }
}
```

### Rich Notifications (iOS)
Configure notification attachments for images:
```tsx
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Photo",
    body: "Check out this image!",
    attachments: [{
      url: "https://example.com/image.jpg"
    }]
  },
  trigger: null
});
```

### Background Notifications
Handle notifications when app is killed:
```tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

## Resources

- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [expo-notifications API Reference](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notification Tool](https://expo.dev/notifications)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [APNs Documentation](https://developer.apple.com/documentation/usernotifications) 