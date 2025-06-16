import { useNotifications } from '@/hooks/useNotifications';
import * as Notifications from 'expo-notifications';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

interface NotificationContextType {
    // Token management
    expoPushToken: string | null;
    devicePushToken: string | null;
    isLoadingToken: boolean;
    tokenError: string | null;

    // Permissions
    notificationPermissionStatus: string | null;
    requestPermissions: () => Promise<boolean>;
    checkPermissions: () => Promise<void>;

    // Actions
    sendTestNotification: () => Promise<void>;
    scheduleNotification: (
        title: string,
        body: string,
        data?: Record<string, any>,
        seconds?: number
    ) => Promise<string>;

    // Utilities
    isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const notifications = useNotifications();
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<string | null>(null);

    // Enhanced iOS permission checking
    const checkIosPermissions = async (): Promise<string> => {
        if (!notifications.isSupported || Platform.OS !== 'ios') {
            return notificationPermissionStatus || 'undetermined';
        }

        try {
            const permissionResponse = await Notifications.getPermissionsAsync();
            const iosStatus = permissionResponse.ios?.status;

            // Map iOS specific statuses to our simplified status
            if (iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
                iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL) {
                return 'granted';
            } else if (iosStatus === Notifications.IosAuthorizationStatus.DENIED) {
                return 'denied';
            } else {
                return 'undetermined';
            }
        } catch (error) {
            console.warn('Error checking iOS notification permissions:', error);
            return notificationPermissionStatus || 'undetermined';
        }
    };

    // Check notification permissions
    const checkPermissions = async () => {
        if (!notifications.isSupported) return;

        try {
            if (Platform.OS === 'ios') {
                const status = await checkIosPermissions();
                setNotificationPermissionStatus(status);
            } else {
                const { status } = await Notifications.getPermissionsAsync();
                setNotificationPermissionStatus(status);
            }
        } catch (error) {
            console.warn('Error checking notification permissions:', error);
        }
    };

    // Handle app state changes for iOS permission sync
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (Platform.OS === 'ios' && nextAppState === 'active') {
            // When app becomes active on iOS, check permissions to sync with system settings
            checkPermissions();
        }
    };

    // Check permissions on mount and when focus changes
    useEffect(() => {
        checkPermissions();

        // For iOS, only check on app state changes to reduce overhead
        // For Android, use lighter polling since permission changes are less frequent
        if (Platform.OS === 'ios') {
            const subscription = AppState.addEventListener('change', handleAppStateChange);
            return () => subscription?.remove();
        } else {
            // Check permissions every 5 seconds on Android (less frequent than before)
            const interval = setInterval(checkPermissions, 5000);
            return () => clearInterval(interval);
        }
    }, []);

    const requestPermissions = async (): Promise<boolean> => {
        const granted = await notifications.requestPermissions();
        await checkPermissions(); // Update status after request
        return granted;
    };

    const sendTestNotification = async () => {
        if (!notifications.isSupported) {
            console.log('Notifications not supported on this platform');
            return;
        }

        await notifications.scheduleLocalNotification({
            title: "Test Notification 🎉",
            body: "This is a test notification from your app!",
            data: { test: true, timestamp: new Date().toISOString() },
            sound: 'default',
            badge: 1,
        });
    };

    const scheduleNotification = async (
        title: string,
        body: string,
        data?: Record<string, any>,
        seconds: number = 5
    ): Promise<string> => {
        return await notifications.scheduleLocalNotification(
            {
                title,
                body,
                data: data || {},
                sound: 'default',
            },
            {
                seconds,
            } as any
        );
    };

    const value: NotificationContextType = {
        // Token management
        expoPushToken: notifications.expoPushToken,
        devicePushToken: notifications.devicePushToken,
        isLoadingToken: notifications.isLoadingToken,
        tokenError: notifications.tokenError,

        // Permissions
        notificationPermissionStatus,
        requestPermissions,
        checkPermissions,

        // Actions
        sendTestNotification,
        scheduleNotification,

        // Utilities
        isSupported: notifications.isSupported,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
} 