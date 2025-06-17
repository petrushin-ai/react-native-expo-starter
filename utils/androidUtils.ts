import { Platform } from 'react-native';

/**
 * Android-specific utilities for handling system-level configurations
 * that can affect Lottie animations
 */

/**
 * Checks if the current platform is Android
 */
export const isAndroid = (): boolean => Platform.OS === 'android';

/**
 * Gets Android-specific Lottie props to improve compatibility
 */
export const getAndroidLottieProps = (enableSafeMode: boolean = true) => {
    if (!isAndroid()) {
        return {};
    }

    return {
        // Enable safe mode (wraps rendering in try-catch)
        enableSafeMode,
        // Use software rendering as fallback
        renderMode: 'SOFTWARE' as const,
        // Ensure proper resize mode
        resizeMode: 'contain' as const,
        // Enable hardware acceleration when available
        hardwareAccelerationAndroid: true,
    };
};

/**
 * Creates a debug message for Android Lottie issues
 */
export const createAndroidDebugMessage = (source: any, error?: any): string => {
    const messages = [
        'Android Lottie Debug Information:',
        `- Platform: ${Platform.OS} ${Platform.Version}`,
        `- Source type: ${typeof source}`,
        `- Has source: ${source ? 'Yes' : 'No'}`,
        `- Error: ${error ? error.message || error : 'None'}`,
        '',
        'Common Android issues:',
        '1. System animations disabled in Developer Options',
        '2. Hardware acceleration issues',
        '3. Non-whole number dimensions in Lottie file',
        '4. Incompatible Lottie JSON version',
        '',
        'Try enabling "Safe Mode" or check system animation settings.',
    ];

    return messages.join('\n');
};

/**
 * Logs Android-specific Lottie debugging information
 */
export const logAndroidLottieDebug = (source: any, error?: any): void => {
    if (isAndroid()) {
        console.warn(createAndroidDebugMessage(source, error));
    }
};

/**
 * Rounds dimensions to whole numbers for Android compatibility
 */
export const roundDimensionsForAndroid = (
    width: number,
    height: number
): { width: number; height: number } => {
    if (isAndroid()) {
        return {
            width: Math.round(width),
            height: Math.round(height),
        };
    }
    return { width, height };
};

/**
 * Creates fallback props for problematic Android devices
 */
export const getAndroidFallbackProps = () => {
    if (!isAndroid()) {
        return {};
    }

    return {
        // Disable hardware acceleration as fallback
        hardwareAccelerationAndroid: false,
        // Use software rendering
        renderMode: 'SOFTWARE' as const,
        // Enable safe mode
        enableSafeMode: true,
        // Reduce animation quality for compatibility
        speed: 0.8,
    };
}; 