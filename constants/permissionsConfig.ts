export interface PermissionConfig {
    notifications: boolean;
    location: boolean;
    // Add more permissions here as needed
}

// Permission configuration from environment variables
export const permissionsConfig: PermissionConfig = {
    notifications: process.env.EXPO_PUBLIC_PERMISSIONS_NOTIFICATIONS === 'true',
    location: process.env.EXPO_PUBLIC_PERMISSIONS_LOCATION === 'true',
};

// Debug mode configuration
export const permissionsDebugMode = process.env.EXPO_PUBLIC_PERMISSIONS_DEBUG === 'true';

// Permission display names for UI
export const permissionDisplayNames: Record<keyof PermissionConfig, string> = {
    notifications: 'Notifications',
    location: 'Location',
};

// Permission descriptions for UI
export const permissionDescriptions: Record<keyof PermissionConfig, string> = {
    notifications: 'Allow the app to send you push notifications',
    location: 'Allow the app to access your location',
}; 