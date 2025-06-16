import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Notifications configuration
 */

// Get project ID from environment or Constants
export const getProjectId = (): string | null => {
    // First try environment variable
    const envProjectId = process.env.EXPO_PROJECT_ID;
    if (envProjectId) {
        return envProjectId;
    }

    // Then try Constants
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

    return projectId || null;
};

// Notification channel configuration for Android
export const NOTIFICATION_CHANNELS = {
    default: {
        name: 'Default',
        importance: 4, // AndroidImportance.HIGH
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        description: 'Default notification channel',
    },
    alerts: {
        name: 'Alerts',
        importance: 5, // AndroidImportance.MAX
        vibrationPattern: [0, 500],
        lightColor: '#FF0000',
        sound: 'default',
        description: 'Important alerts and warnings',
    },
    reminders: {
        name: 'Reminders',
        importance: 3, // AndroidImportance.DEFAULT
        vibrationPattern: [0, 250],
        lightColor: '#0000FF',
        sound: 'default',
        description: 'Scheduled reminders',
    },
} as const;

// Default notification handler configuration
export const DEFAULT_NOTIFICATION_HANDLER = {
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
};

// Notification categories for interactive notifications
export const NOTIFICATION_CATEGORIES = {
    message: {
        identifier: 'message',
        actions: [
            {
                identifier: 'reply',
                buttonTitle: 'Reply',
                textInput: {
                    submitButtonTitle: 'Send',
                    placeholder: 'Type your reply...',
                },
            },
            {
                identifier: 'dismiss',
                buttonTitle: 'Dismiss',
                options: {
                    isDestructive: true,
                },
            },
        ],
    },
    reminder: {
        identifier: 'reminder',
        actions: [
            {
                identifier: 'complete',
                buttonTitle: 'Mark as Complete',
                options: {
                    isAuthenticationRequired: false,
                },
            },
            {
                identifier: 'snooze',
                buttonTitle: 'Snooze',
            },
        ],
    },
} as const;

// Helper to check if push notifications are supported
export const isPushNotificationSupported = (): boolean => {
    return Platform.OS !== 'web';
}; 