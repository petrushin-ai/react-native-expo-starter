import { ImageSourcePropType, Platform } from 'react-native';

interface UseNativeAssetOptions {
    /**
     * The name of the native asset (without extension)
     */
    nativeAssetName: string;
    /**
     * Fallback source for Android or if native asset is not available
     */
    fallbackSource?: ImageSourcePropType;
    /**
     * Dimensions required for native assets
     */
    dimensions: {
        width: number;
        height: number;
    };
}

interface NativeAssetResult {
    /**
     * The image source to use
     */
    source: ImageSourcePropType;
    /**
     * Whether the native asset is being used
     */
    isNative: boolean;
    /**
     * The platform-specific dimensions
     */
    dimensions: {
        width: number;
        height: number;
    };
}

/**
 * Hook for using native iOS assets with fallback support
 * 
 * @example
 * const { source, isNative, dimensions } = useNativeAsset({
 *   nativeAssetName: 'chevron-left',
 *   fallbackSource: require('./assets/chevron-left.png'),
 *   dimensions: { width: 20, height: 20 }
 * });
 * 
 * <Image source={source} style={dimensions} />
 */
export function useNativeAsset({
    nativeAssetName,
    fallbackSource,
    dimensions,
}: UseNativeAssetOptions): NativeAssetResult {
    // On iOS, use the native asset
    if (Platform.OS === 'ios') {
        return {
            source: {
                uri: nativeAssetName,
                width: dimensions.width,
                height: dimensions.height
            },
            isNative: true,
            dimensions,
        };
    }

    // On Android or web, use the fallback
    if (fallbackSource) {
        return {
            source: fallbackSource,
            isNative: false,
            dimensions,
        };
    }

    // If no fallback, return a transparent 1x1 pixel
    return {
        source: {
            uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        },
        isNative: false,
        dimensions,
    };
} 