import { PermissionConfig, permissionsConfig } from '@/constants/permissionsConfig';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { usePermissions } from '@/hooks/usePermissions';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';

export type PermissionModalData = {
    visible: boolean;
    title: string;
    message: string;
    permissionType: string;
    permission: keyof PermissionConfig | 'notifications';
};

export function useStartupPermissions() {
    const [permissionModal, setPermissionModal] = useState<PermissionModalData>({
        visible: false,
        title: '',
        message: '',
        permissionType: '',
        permission: 'notifications',
    });

    const {
        notificationPermissionStatus,
        requestPermissions: requestNotificationPermissions,
        checkPermissions: checkNotificationPermissions,
        isSupported: notificationsSupported
    } = useNotificationContext();

    const {
        permissions,
        requestPermission,
        checkPermissions
    } = usePermissions();

    const hasRunStartupCheck = useRef(false);
    const appStateRef = useRef(AppState.currentState);

    // Enhanced iOS permission checking
    const checkIosNotificationPermissions = useCallback(async (): Promise<string> => {
        if (!notificationsSupported || Platform.OS !== 'ios') {
            return notificationPermissionStatus || 'undetermined';
        }

        try {
            // Get fresh permission status
            const permissionResponse = await Notifications.getPermissionsAsync();

            // On iOS, check the detailed status
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
    }, [notificationPermissionStatus, notificationsSupported]);

    // Check if all environment-defined permissions are granted
    const checkAllPermissionsStatus = useCallback(async () => {
        const results: Record<string, string> = {};

        // Check notifications if enabled
        if (permissionsConfig.notifications && notificationsSupported) {
            if (Platform.OS === 'ios') {
                results.notifications = await checkIosNotificationPermissions();
            } else {
                results.notifications = notificationPermissionStatus || 'undetermined';
            }
        }

        // Check other permissions
        for (const [permission, isEnabled] of Object.entries(permissionsConfig)) {
            if (isEnabled && permission !== 'notifications') {
                results[permission] = permissions[permission as keyof PermissionConfig] || 'undetermined';
            }
        }

        return results;
    }, [
        permissionsConfig,
        notificationsSupported,
        notificationPermissionStatus,
        permissions,
        checkIosNotificationPermissions
    ]);

    // Show permission modal
    const showPermissionModal = useCallback((
        permission: keyof PermissionConfig | 'notifications',
        permissionDisplayName: string
    ) => {
        const isNotifications = permission === 'notifications';

        setPermissionModal({
            visible: true,
            title: `${permissionDisplayName} Permission Required`,
            message: isNotifications
                ? 'This app needs notification permissions to keep you updated with important information.'
                : `This app needs ${permissionDisplayName.toLowerCase()} permission to provide you with the best experience.`,
            permissionType: permissionDisplayName,
            permission,
        });
    }, []);

    // Request a specific permission
    const requestSpecificPermission = useCallback(async (
        permission: keyof PermissionConfig | 'notifications'
    ): Promise<boolean> => {
        if (permission === 'notifications') {
            if (!notificationsSupported) return false;

            try {
                const granted = await requestNotificationPermissions();
                await checkNotificationPermissions();
                return granted;
            } catch (error) {
                console.warn('Error requesting notification permissions:', error);
                return false;
            }
        } else {
            try {
                const status = await requestPermission(permission);
                return status === 'granted';
            } catch (error) {
                console.warn(`Error requesting ${permission} permission:`, error);
                return false;
            }
        }
    }, [notificationsSupported, requestNotificationPermissions, requestPermission, checkNotificationPermissions]);

    // Check and request permissions at startup
    const checkAndRequestStartupPermissions = useCallback(async () => {
        if (hasRunStartupCheck.current) return;
        hasRunStartupCheck.current = true;

        try {
            // Refresh current permission states first
            await checkPermissions();
            await checkNotificationPermissions();

            // Small delay to ensure states are updated
            await new Promise(resolve => setTimeout(resolve, 500));

            const currentPermissions = await checkAllPermissionsStatus();
            const permissionDisplayNames = {
                notifications: 'Notifications',
                location: 'Location',
            };

            // Check each enabled permission
            for (const [permission, status] of Object.entries(currentPermissions)) {
                if (status !== 'granted') {
                    const permissionKey = permission as keyof PermissionConfig | 'notifications';
                    const displayName = permissionDisplayNames[permissionKey] || permission;

                    // Try to request permission first
                    const granted = await requestSpecificPermission(permissionKey);

                    if (!granted) {
                        // If not granted, check if we can ask again
                        if (permissionKey === 'notifications' && Platform.OS === 'ios') {
                            const permissionResponse = await Notifications.getPermissionsAsync();
                            const canAskAgain = permissionResponse.canAskAgain;

                            if (!canAskAgain) {
                                // Show modal directing to settings
                                showPermissionModal(permissionKey, displayName);
                                break; // Show one modal at a time
                            }
                        } else {
                            // For other permissions or Android, check if denied and show modal
                            const updatedStatus = await checkAllPermissionsStatus();
                            if (updatedStatus[permission] === 'denied') {
                                showPermissionModal(permissionKey, displayName);
                                break; // Show one modal at a time
                            }
                        }
                    }

                    // Add delay between permission requests to avoid overwhelming user
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.warn('Error during startup permission check:', error);
        }
    }, [
        checkPermissions,
        checkNotificationPermissions,
        checkAllPermissionsStatus,
        requestSpecificPermission,
        showPermissionModal
    ]);

    // Handle app state changes for re-checking permissions
    const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
        if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
            // App has come to foreground, refresh permission status
            checkPermissions();
            checkNotificationPermissions();
        }
        appStateRef.current = nextAppState;
    }, [checkPermissions, checkNotificationPermissions]);

    // Run startup check on mount
    useEffect(() => {
        // Small delay to ensure all contexts are initialized
        const timer = setTimeout(() => {
            checkAndRequestStartupPermissions();
        }, 1000);

        return () => clearTimeout(timer);
    }, [checkAndRequestStartupPermissions]);

    // Listen for app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [handleAppStateChange]);

    // Handle opening settings
    const handleOpenSettings = useCallback(() => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    }, []);

    // Close permission modal
    const closePermissionModal = useCallback(() => {
        setPermissionModal(prev => ({ ...prev, visible: false }));
    }, []);

    // Manually trigger permission check (useful for settings screen)
    const recheckPermissions = useCallback(async () => {
        hasRunStartupCheck.current = false;
        await checkAndRequestStartupPermissions();
    }, [checkAndRequestStartupPermissions]);

    return {
        permissionModal,
        closePermissionModal,
        handleOpenSettings,
        recheckPermissions,
        checkAllPermissionsStatus,
    };
} 