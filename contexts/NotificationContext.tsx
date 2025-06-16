import { useNotifications } from '@/hooks/useNotifications';
import React, { createContext, ReactNode, useContext } from 'react';

interface NotificationContextType {
    // Token management
    expoPushToken: string | null;
    devicePushToken: string | null;
    isLoadingToken: boolean;
    tokenError: string | null;

    // Permissions
    requestPermissions: () => Promise<boolean>;

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
        requestPermissions: notifications.requestPermissions,

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