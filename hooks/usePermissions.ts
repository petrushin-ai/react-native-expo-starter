import { PermissionConfig, permissionsConfig } from '@/constants/permissionsConfig';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useStorageState } from './useStorageState';

export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface PermissionState {
    notifications: PermissionStatus;
    location: PermissionStatus;
}

export function usePermissions() {
    const [[isLoading, cachedPermissions], setCachedPermissions] = useStorageState('permissions');
    const [permissions, setPermissions] = useState<PermissionState>({
        notifications: 'undetermined',
        location: 'undetermined',
    });

    // Load cached permissions on mount
    useEffect(() => {
        if (cachedPermissions) {
            try {
                const parsed = JSON.parse(cachedPermissions);
                setPermissions(parsed);
            } catch (e) {
                console.error('Failed to parse cached permissions:', e);
            }
        }
    }, [cachedPermissions]);

    // Check current permission status
    const checkPermissions = useCallback(async () => {
        const newPermissions: PermissionState = {
            notifications: 'undetermined',
            location: 'undetermined',
        };

        // Check notifications permission
        if (permissionsConfig.notifications) {
            const { status } = await Notifications.getPermissionsAsync();
            newPermissions.notifications = status;
        }

        // Check location permission
        if (permissionsConfig.location) {
            const { status } = await Location.getForegroundPermissionsAsync();
            newPermissions.location = status;
        }

        setPermissions(newPermissions);
        setCachedPermissions(JSON.stringify(newPermissions));
        return newPermissions;
    }, [setCachedPermissions]);

    // Request notification permission
    const requestNotificationPermission = useCallback(async (): Promise<PermissionStatus> => {
        if (!permissionsConfig.notifications) {
            return 'denied';
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        if (existingStatus === 'granted') {
            return 'granted';
        }

        if (existingStatus === 'denied') {
            Alert.alert(
                'Permission Required',
                'Please enable notifications in your device settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
            return 'denied';
        }

        const { status } = await Notifications.requestPermissionsAsync();
        await checkPermissions();
        return status;
    }, [checkPermissions]);

    // Request location permission
    const requestLocationPermission = useCallback(async (): Promise<PermissionStatus> => {
        if (!permissionsConfig.location) {
            return 'denied';
        }

        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

        if (existingStatus === 'granted') {
            return 'granted';
        }

        if (existingStatus === 'denied') {
            Alert.alert(
                'Permission Required',
                'Please enable location access in your device settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
            return 'denied';
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        await checkPermissions();
        return status;
    }, [checkPermissions]);

    // Request a specific permission
    const requestPermission = useCallback(async (permission: keyof PermissionConfig): Promise<PermissionStatus> => {
        switch (permission) {
            case 'notifications':
                return requestNotificationPermission();
            case 'location':
                return requestLocationPermission();
            default:
                return 'denied';
        }
    }, [requestNotificationPermission, requestLocationPermission]);

    // Reset all permissions (for debug mode)
    const resetPermissions = useCallback(async () => {
        // Note: We can't actually reset system permissions, but we can clear our cache
        // and prompt the user to go to settings
        setCachedPermissions(null);
        setPermissions({
            notifications: 'undetermined',
            location: 'undetermined',
        });

        Alert.alert(
            'Reset Permissions',
            'Permission cache has been cleared. To fully reset permissions, please go to your device settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
        );
    }, [setCachedPermissions]);

    // Check permissions on mount and when app becomes active
    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    return {
        permissions,
        isLoading,
        checkPermissions,
        requestPermission,
        resetPermissions,
    };
} 