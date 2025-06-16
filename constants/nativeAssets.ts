/**
 * Configuration for native assets bundled with expo-native-asset
 * These assets are included in the iOS asset catalog for optimal performance
 */

export const NATIVE_ASSETS = {
    // Navigation icons
    navigation: {
        chevronLeft: {
            name: 'chevron-left',
            width: 24,
            height: 24,
        },
        chevronRight: {
            name: 'chevron-right',
            width: 24,
            height: 24,
        },
    },

    // App branding
    branding: {
        appLogo: {
            name: 'app-logo',
            width: 120,
            height: 120,
        },
    },
} as const;

/**
 * Helper function to get native asset configuration
 * @param category - The asset category (e.g., 'navigation', 'branding')
 * @param assetKey - The specific asset key within the category
 * @returns The asset configuration or undefined if not found
 */
export function getNativeAsset<
    C extends keyof typeof NATIVE_ASSETS,
    K extends keyof typeof NATIVE_ASSETS[C]
>(category: C, assetKey: K): typeof NATIVE_ASSETS[C][K] {
    return NATIVE_ASSETS[category][assetKey];
} 