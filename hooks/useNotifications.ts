import {
    DEFAULT_NOTIFICATION_HANDLER,
    getProjectId,
    isPushNotificationSupported,
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_CHANNELS
} from '@/constants/notificationsConfig';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

interface UseNotificationsResult {
    // Token management
    expoPushToken: string | null;
    devicePushToken: string | null;
    isLoadingToken: boolean;
    tokenError: string | null;

    // Permissions
    notificationPermissions: Notifications.NotificationPermissionsStatus | null;
    requestPermissions: () => Promise<boolean>;

    // Notification state
    notification: Notifications.Notification | null;
    lastNotificationResponse: Notifications.NotificationResponse | null;

    // Actions
    scheduleLocalNotification: (
        content: Notifications.NotificationContentInput,
        trigger?: Notifications.NotificationTriggerInput
    ) => Promise<string>;
    cancelNotification: (notificationId: string) => Promise<void>;
    cancelAllNotifications: () => Promise<void>;
    setBadgeCount: (count: number) => Promise<boolean>;
    getBadgeCount: () => Promise<number>;

    // Utilities
    isSupported: boolean;
}

export function useNotifications(): UseNotificationsResult {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [notificationPermissions, setNotificationPermissions] =
        useState<Notifications.NotificationPermissionsStatus | null>(null);

    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const lastNotificationResponseData = Notifications.useLastNotificationResponse();

    const isSupported = isPushNotificationSupported();

    // Initialize notification handler
    useEffect(() => {
        if (!isSupported) return;

        Notifications.setNotificationHandler(DEFAULT_NOTIFICATION_HANDLER);
    }, [isSupported]);

    // Set up notification channels (Android)
    useEffect(() => {
        if (!isSupported || Platform.OS !== 'android') return;

        const setupChannels = async () => {
            for (const [channelId, config] of Object.entries(NOTIFICATION_CHANNELS)) {
                await Notifications.setNotificationChannelAsync(channelId, {
                    name: config.name,
                    importance: config.importance as Notifications.AndroidImportance,
                    vibrationPattern: [...config.vibrationPattern],
                    lightColor: config.lightColor,
                    sound: config.sound,
                    description: config.description,
                });
            }
        };

        setupChannels();
    }, [isSupported]);

    // Set up notification categories (iOS)
    useEffect(() => {
        if (!isSupported || Platform.OS !== 'ios') return;

        const setupCategories = async () => {
            for (const category of Object.values(NOTIFICATION_CATEGORIES)) {
                await Notifications.setNotificationCategoryAsync(
                    category.identifier,
                    category.actions.map(action => ({
                        identifier: action.identifier,
                        buttonTitle: action.buttonTitle,
                        textInput: 'textInput' in action ? action.textInput : undefined,
                        options: {
                            ...'options' in action ? action.options : {},
                            opensAppToForeground: 'options' in action && action.options?.opensAppToForeground !== undefined
                                ? action.options.opensAppToForeground
                                : true,
                        },
                    }))
                );
            }
        };

        setupCategories();
    }, [isSupported]);

    // Register for push notifications
    useEffect(() => {
        if (!isSupported) {
            setIsLoadingToken(false);
            return;
        }

        registerForPushNotificationsAsync()
            .then(tokens => {
                if (tokens) {
                    setExpoPushToken(tokens.expoPushToken);
                    setDevicePushToken(tokens.devicePushToken);
                }
            })
            .catch(error => {
                setTokenError(error.message);
                console.error('Failed to get push token:', error);
            })
            .finally(() => {
                setIsLoadingToken(false);
            });

        // Set up listeners
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [isSupported]);

    // Check permissions on mount
    useEffect(() => {
        if (!isSupported) return;

        Notifications.getPermissionsAsync().then(setNotificationPermissions);
    }, [isSupported]);

    const requestPermissions = async (): Promise<boolean> => {
        if (!isSupported) return false;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        const permissions = await Notifications.getPermissionsAsync();
        setNotificationPermissions(permissions);

        return finalStatus === 'granted';
    };

    const scheduleLocalNotification = async (
        content: Notifications.NotificationContentInput,
        trigger: Notifications.NotificationTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1
        }
    ): Promise<string> => {
        if (!isSupported) {
            throw new Error('Notifications are not supported on this platform');
        }

        return await Notifications.scheduleNotificationAsync({
            content,
            trigger,
        });
    };

    const cancelNotification = async (notificationId: string): Promise<void> => {
        if (!isSupported) return;

        await Notifications.cancelScheduledNotificationAsync(notificationId);
    };

    const cancelAllNotifications = async (): Promise<void> => {
        if (!isSupported) return;

        await Notifications.cancelAllScheduledNotificationsAsync();
    };

    const setBadgeCount = async (count: number): Promise<boolean> => {
        if (!isSupported) return false;

        return await Notifications.setBadgeCountAsync(count);
    };

    const getBadgeCount = async (): Promise<number> => {
        if (!isSupported) return 0;

        return await Notifications.getBadgeCountAsync();
    };

    return {
        // Token management
        expoPushToken,
        devicePushToken,
        isLoadingToken,
        tokenError,

        // Permissions
        notificationPermissions,
        requestPermissions,

        // Notification state
        notification,
        lastNotificationResponse: lastNotificationResponseData || null,

        // Actions
        scheduleLocalNotification,
        cancelNotification,
        cancelAllNotifications,
        setBadgeCount,
        getBadgeCount,

        // Utilities
        isSupported,
    };
}

// Helper function to register for push notifications
async function registerForPushNotificationsAsync(): Promise<{
    expoPushToken: string | null;
    devicePushToken: string | null;
} | null> {
    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
    }

    let expoPushToken: string | null = null;
    let devicePushToken: string | null = null;

    try {
        // Get Expo push token
        const projectId = getProjectId();
        if (!projectId) {
            throw new Error('Project ID not found. Please set EXPO_PROJECT_ID environment variable.');
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        expoPushToken = tokenData.data;
        console.log('Expo push token:', expoPushToken);
    } catch (error) {
        console.error('Error getting Expo push token:', error);
    }

    try {
        // Get device push token
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const deviceTokenData = await Notifications.getDevicePushTokenAsync();
        devicePushToken = deviceTokenData.data;
        console.log('Device push token:', devicePushToken);
    } catch (error) {
        console.error('Error getting device push token:', error);
    }

    return { expoPushToken, devicePushToken };
} 