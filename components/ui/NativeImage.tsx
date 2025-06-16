import React from 'react';
import { Image, ImageProps, Platform } from 'react-native';

interface NativeImageProps extends Omit<ImageProps, 'source'> {
    /**
     * The name of the native asset (without extension)
     * This should match the name in your expo-native-asset configuration
     */
    nativeAssetName: string;
    /**
     * Fallback source for Android or if native asset is not available
     */
    fallbackSource?: ImageProps['source'];
    /**
     * Width of the image (required for native assets)
     */
    width: number;
    /**
     * Height of the image (required for native assets)
     */
    height: number;
}

/**
 * A wrapper component for using native iOS assets with fallback support
 * 
 * On iOS: Uses the native asset from the asset catalog
 * On Android: Uses the fallback source or shows a placeholder
 * 
 * @example
 * <NativeImage
 *   nativeAssetName="chevron-left"
 *   fallbackSource={require('./assets/chevron-left.png')}
 *   width={20}
 *   height={20}
 * />
 */
export function NativeImage({
    nativeAssetName,
    fallbackSource,
    width,
    height,
    style,
    ...props
}: NativeImageProps) {
    // On iOS, use the native asset
    if (Platform.OS === 'ios') {
        return (
            <Image
                source={{ uri: nativeAssetName, width, height }}
                style={[{ width, height }, style]}
                {...props}
            />
        );
    }

    // On Android, use the fallback source
    if (fallbackSource) {
        return (
            <Image
                source={fallbackSource}
                style={[{ width, height }, style]}
                {...props}
            />
        );
    }

    // If no fallback, return a placeholder view
    return (
        <Image
            source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }}
            style={[{ width, height, backgroundColor: '#f0f0f0' }, style]}
            {...props}
        />
    );
} 