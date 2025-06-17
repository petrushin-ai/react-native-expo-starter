import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

type FileOperationResult = {
    success: boolean;
    error?: Error;
    path?: string;
};

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}downloads/`;
const ALBUM_NAME = 'ReactNativeExpo';

async function ensureDirectoryExists(dirPath: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }
}

async function downloadToCache(url: string): Promise<FileOperationResult> {
    try {
        const filename = url.split('/').pop() || `file_${Date.now()}.pdf`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
            return { success: true, path: fileUri };
        }

        const downloadResult = await FileSystem.downloadAsync(url, fileUri);
        return { success: true, path: downloadResult.uri };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

async function saveToDownloads(sourcePath: string, filename: string): Promise<FileOperationResult> {
    try {
        await ensureDirectoryExists(DOWNLOADS_DIR);
        const downloadPath = `${DOWNLOADS_DIR}${filename}`;

        await FileSystem.copyAsync({
            from: sourcePath,
            to: downloadPath,
        });

        return { success: true, path: downloadPath };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

async function saveToMediaLibrary(filePath: string): Promise<FileOperationResult> {
    try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Media library permission not granted');
        }

        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (!album) {
            album = await MediaLibrary.createAlbumAsync(ALBUM_NAME);
        }

        const asset = await MediaLibrary.createAssetAsync(filePath);
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);

        return { success: true, path: filePath };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

async function shareFile(filePath: string): Promise<FileOperationResult> {
    try {
        await Sharing.shareAsync(filePath, {
            mimeType: 'application/pdf',
            dialogTitle: 'Open PDF with...',
        });
        return { success: true, path: filePath };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

export async function downloadFile(url: string): Promise<boolean> {
    try {
        const downloadResult = await downloadToCache(url);
        if (!downloadResult.success || !downloadResult.path) {
            console.error('❌ Failed to download file:', downloadResult.error);
            Alert.alert('Download failed', 'Unable to download the file.');
            return false;
        }

        const filePath = downloadResult.path;
        const filename = url.split('/').pop() || `file_${Date.now()}.pdf`;
        let finalPath: string | undefined = filePath;
        let saved = false;

        if (Platform.OS === 'android') {
            // On Android, save to downloads folder first
            const saveResult = await saveToDownloads(filePath, filename);
            if (!saveResult.success) {
                console.warn('Could not save to internal downloads, falling back to MediaLibrary...');
                const fallback = await saveToMediaLibrary(filePath);
                saved = fallback.success;
                finalPath = fallback.path || filePath;
            } else {
                saved = true;
                finalPath = saveResult.path;
            }

            // Immediately show the native sharing dialog on Android
            if (saved && finalPath) {
                try {
                    await Sharing.shareAsync(finalPath, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Open PDF with...',
                    });
                } catch (error) {
                    console.warn('Could not share file:', error);
                }
            } else {
                Alert.alert('Save failed', 'File could not be saved.');
            }
        } else {
            // On iOS, directly share the file
            const shareResult = await shareFile(filePath);
            saved = shareResult.success;
        }

        return saved;
    } catch (err) {
        console.error('Unexpected error in downloadFile:', err);
        Alert.alert('Unexpected error', 'An unexpected error occurred while downloading the file.');
        return false;
    }
}

export async function openPDFWithIntent(url: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return false;
    }

    try {
        const downloadResult = await downloadToCache(url);
        if (!downloadResult.success || !downloadResult.path) {
            return false;
        }

        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: downloadResult.path,
            type: 'application/pdf',
            flags: 1,
        });

        return true;
    } catch (error) {
        console.error('Failed to open PDF with intent:', error);
        return false;
    }
} 