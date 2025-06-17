import { Platform } from 'react-native';

/**
 * Utility functions for handling Lottie animations with Android-specific fixes
 */

export interface LottieMetadata {
    width: number;
    height: number;
    duration?: number;
    frameRate?: number;
}

/**
 * Gets the appropriate Lottie source based on platform
 * Uses JSON for Android (better compatibility) and dotLottie for iOS (smaller size)
 */
export const getPlatformLottieSource = (baseName: string) => {
    if (Platform.OS === 'android') {
        // Use JSON format for Android to avoid parsing issues
        switch (baseName) {
            case 'spinner':
                return require('@/assets/lottie/spinner.json');
            case 'splash':
                return require('@/assets/lottie/splash.json');
            default:
                console.warn(`Unknown Lottie animation: ${baseName}`);
                return require('@/assets/lottie/spinner.json'); // fallback
        }
    } else {
        // Use dotLottie format for iOS (smaller file size, better performance)
        switch (baseName) {
            case 'spinner':
                return require('@/assets/lottie/spinner.lottie');
            case 'splash':
                return require('@/assets/lottie/splash.lottie');
            default:
                console.warn(`Unknown Lottie animation: ${baseName}`);
                return require('@/assets/lottie/spinner.lottie'); // fallback
        }
    }
};

/**
 * Validates if Lottie dimensions are Android-compatible
 * Android has issues with non-whole number dimensions
 */
export const validateLottieDimensions = (metadata: LottieMetadata): boolean => {
    if (Platform.OS !== 'android') {
        return true;
    }

    const { width, height } = metadata;
    return Number.isInteger(width) && Number.isInteger(height);
};

/**
 * Fixes Lottie dimensions for Android compatibility
 * Rounds non-whole numbers to nearest integers
 */
export const fixLottieDimensions = (metadata: LottieMetadata): LottieMetadata => {
    if (Platform.OS !== 'android') {
        return metadata;
    }

    return {
        ...metadata,
        width: Math.round(metadata.width),
        height: Math.round(metadata.height),
    };
};

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
        // Use software rendering as fallback for problematic devices
        renderMode: 'SOFTWARE' as const,
        // Ensure proper resize mode for consistent positioning
        resizeMode: 'contain' as const,
        // Enable hardware acceleration when available
        hardwareAccelerationAndroid: true,
        // Disable merge paths to avoid rendering issues
        enableMergePathsAndroidForKitKatAndAbove: false,
        // Use caching for better performance
        cacheComposition: true,
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
        '5. dotLottie parsing issues (use JSON instead)',
        '',
        'Solutions applied:',
        '- Using JSON format for Android compatibility',
        '- Safe mode enabled',
        '- Software rendering fallback',
        '- Dimension rounding',
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
        // Disable merge paths
        enableMergePathsAndroidForKitKatAndAbove: false,
    };
};

/**
 * Comprehensive Android optimization props
 */
export const getComprehensiveAndroidProps = (enableSafeMode: boolean = true) => {
    if (!isAndroid()) {
        return {};
    }

    return {
        // Core Android fixes
        enableSafeMode,
        renderMode: 'SOFTWARE' as const,
        resizeMode: 'contain' as const,

        // Performance optimizations
        cacheComposition: true,
        hardwareAccelerationAndroid: false, // Disabled for compatibility

        // Compatibility fixes
        enableMergePathsAndroidForKitKatAndAbove: false,

        // Animation settings
        speed: 1.0,
        autoPlay: true,
        loop: true,
    };
};

/**
 * Gets optimal render settings for Android Lottie animations
 */
export const getAndroidLottieSettings = () => {
    if (Platform.OS !== 'android') {
        return {};
    }

    return {
        // Use hardware acceleration when available
        renderMode: 'HARDWARE' as const,
        // Enable composition caching for better performance
        cacheComposition: true,
        // Use contain resize mode for consistent positioning
        resizeMode: 'contain' as const,
        // Optimize for memory usage
        enableMergePathsAndroidForKitKatAndAbove: true,
    };
};

/**
 * Calculates safe dimensions for Lottie animations on Android
 * Takes into account screen density and device capabilities
 */
export const calculateSafeLottieDimensions = (
    desiredWidth: number,
    desiredHeight: number,
    maxSize?: number
): { width: number; height: number } => {
    let width = desiredWidth;
    let height = desiredHeight;

    // Apply max size constraint if provided
    if (maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        if (scale < 1) {
            width *= scale;
            height *= scale;
        }
    }

    // Round dimensions for Android compatibility
    if (Platform.OS === 'android') {
        width = Math.round(width);
        height = Math.round(height);

        // Ensure minimum size for proper rendering
        width = Math.max(width, 1);
        height = Math.max(height, 1);
    }

    return { width, height };
};

/**
 * Detects potential Android compatibility issues with Lottie files
 */
export const detectAndroidCompatibilityIssues = (metadata: LottieMetadata): string[] => {
    if (Platform.OS !== 'android') {
        return [];
    }

    const issues: string[] = [];

    // Check for non-whole number dimensions
    if (!Number.isInteger(metadata.width) || !Number.isInteger(metadata.height)) {
        issues.push('Non-whole number dimensions detected. This may cause rendering issues on Android.');
    }

    // Check for very small dimensions
    if (metadata.width < 1 || metadata.height < 1) {
        issues.push('Dimensions are too small and may not render properly on Android.');
    }

    // Check for very large dimensions
    if (metadata.width > 2048 || metadata.height > 2048) {
        issues.push('Dimensions are very large and may cause memory issues on Android.');
    }

    // Check frame rate
    if (metadata.frameRate && metadata.frameRate > 60) {
        issues.push('High frame rate detected. Consider reducing for better Android performance.');
    }

    return issues;
};

/**
 * Creates Android-optimized style properties for Lottie containers
 */
export const getAndroidOptimizedStyles = () => {
    if (Platform.OS !== 'android') {
        return {};
    }

    return {
        // Prevent clipping issues
        overflow: 'hidden' as const,
        // Improve rendering performance
        backfaceVisibility: 'hidden' as const,
        // Prevent elevation conflicts
        elevation: 0,
        // Ensure proper layering
        zIndex: 0,
    };
};

/**
 * Default Android-safe Lottie props
 */
export const getDefaultAndroidLottieProps = () => {
    if (Platform.OS !== 'android') {
        return {};
    }

    return {
        ...getAndroidLottieSettings(),
        // Safe defaults for Android
        speed: 1,
        progress: undefined, // Let autoPlay handle it
        enableMergePathsAndroidForKitKatAndAbove: true,
        // Prevent common Android issues
        useNativeLooping: false, // Use JS looping for better control
    };
}; 