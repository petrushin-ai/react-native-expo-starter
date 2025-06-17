import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useColorScheme } from '@/hooks/useColorScheme';
import { downloadFile } from '@/utils/fileDownload';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface PDFViewerProps {
    /** PDF URL to display and download */
    url: string | null;
    /** Title for the PDF document */
    title?: string;
    /** Show view button */
    showViewButton?: boolean;
    /** Show download button */
    showDownloadButton?: boolean;
    /** Custom view button text */
    viewButtonText?: string;
    /** Custom download button text */
    downloadButtonText?: string;
    /** Button variant for styling */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    /** Button size */
    size?: 'small' | 'medium' | 'large';
    /** Custom styles for the container */
    style?: any;
    /** Callback when view is initiated */
    onViewStart?: () => void;
    /** Callback when view is completed */
    onViewEnd?: () => void;
    /** Callback when download is initiated */
    onDownloadStart?: () => void;
    /** Callback when download is completed */
    onDownloadEnd?: (success: boolean) => void;
}

export interface PDFViewerModalProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** PDF URL to display */
    url: string | null;
    /** Title for the modal and PDF */
    title?: string;
}

/**
 * PDF Viewer Component
 * 
 * Provides buttons to view and download PDF files.
 * Uses Google Docs viewer for PDF display in WebBrowser.
 * 
 * @example
 * ```tsx
 * <PDFViewer
 *   url="https://example.com/document.pdf"
 *   title="Sample Document"
 *   showViewButton={true}
 *   showDownloadButton={true}
 *   onDownloadEnd={(success) => console.log('Download:', success)}
 * />
 * ```
 */
export function PDFViewer({
    url,
    title = 'PDF Document',
    showViewButton = true,
    showDownloadButton = true,
    viewButtonText = 'View PDF',
    downloadButtonText = 'Download',
    variant = 'primary',
    size = 'medium',
    style,
    onViewStart,
    onViewEnd,
    onDownloadStart,
    onDownloadEnd,
}: PDFViewerProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isDownloading, setIsDownloading] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const handleView = async () => {
        if (!url) {
            Alert.alert('Error', 'No PDF URL provided');
            return;
        }

        setIsViewing(true);
        onViewStart?.();

        try {
            // Use Google Docs viewer to display PDF in browser
            const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

            await WebBrowser.openBrowserAsync(googleDocsUrl, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                toolbarColor: isDark ? '#111827' : '#F9FAFB',
                controlsColor: isDark ? '#60A5FA' : '#3B82F6',
                dismissButtonStyle: 'close',
                showTitle: true,
            });
        } catch (error) {
            console.error('Error opening PDF:', error);
            Alert.alert('Error', 'Unable to open PDF viewer');
        } finally {
            setIsViewing(false);
            onViewEnd?.();
        }
    };

    const handleDownload = async () => {
        if (!url) {
            Alert.alert('Error', 'No PDF URL provided');
            return;
        }

        setIsDownloading(true);
        onDownloadStart?.();

        try {
            const success = await downloadFile(url);
            onDownloadEnd?.(success);

            if (success) {
                Alert.alert('Success', 'PDF downloaded successfully');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            Alert.alert('Error', 'Failed to download PDF');
            onDownloadEnd?.(false);
        } finally {
            setIsDownloading(false);
        }
    };

    const isDisabled = !url;

    return (
        <View style={[styles.container, style]}>
            {showViewButton && (
                <Button
                    title={isViewing ? 'Opening...' : viewButtonText}
                    onPress={handleView}
                    variant={variant}
                    size={size}
                    disabled={isDisabled || isViewing}
                    loading={isViewing}
                    style={styles.button}
                />
            )}

            {showDownloadButton && (
                <Button
                    title={isDownloading ? 'Downloading...' : downloadButtonText}
                    onPress={handleDownload}
                    variant={variant === 'primary' ? 'secondary' : 'outline'}
                    size={size}
                    disabled={isDisabled || isDownloading}
                    loading={isDownloading}
                    style={styles.button}
                />
            )}
        </View>
    );
}

/**
 * PDF Viewer Modal Component
 * 
 * A modal wrapper that automatically opens PDF in WebBrowser when visible.
 * Useful for triggering PDF view from other components.
 * 
 * @example
 * ```tsx
 * <PDFViewerModal
 *   visible={showPDF}
 *   onClose={() => setShowPDF(false)}
 *   url="https://example.com/document.pdf"
 *   title="Sample Document"
 * />
 * ```
 */
export function PDFViewerModal({
    visible,
    onClose,
    url,
    title = 'PDF Document'
}: PDFViewerModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleOpenPDF = async () => {
        if (url) {
            try {
                // Use Google Docs viewer to display PDF in browser
                const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

                await WebBrowser.openBrowserAsync(googleDocsUrl, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                    toolbarColor: isDark ? '#111827' : '#F9FAFB',
                    controlsColor: isDark ? '#60A5FA' : '#3B82F6',
                    dismissButtonStyle: 'close',
                    showTitle: true,
                });

                onClose();
            } catch (error) {
                console.error('Error opening PDF:', error);
                onClose();
            }
        }
    };

    React.useEffect(() => {
        if (visible && url) {
            handleOpenPDF();
        }
    }, [visible, url]);

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title="Open PDF"
            message={`Opening ${title}...`}
            type="info"
            primaryButtonText="Cancel"
        />
    );
}

/**
 * PDF Action Button Component
 * 
 * A simple icon button for PDF actions (view/download).
 * Useful for compact UI layouts.
 * 
 * @example
 * ```tsx
 * <PDFActionButton
 *   type="view"
 *   url="https://example.com/document.pdf"
 *   title="Sample Document"
 * />
 * ```
 */
export interface PDFActionButtonProps {
    /** Type of action */
    type: 'view' | 'download';
    /** PDF URL */
    url: string | null;
    /** PDF title */
    title?: string;
    /** Icon size */
    size?: number;
    /** Icon color */
    color?: string;
    /** Button style */
    style?: any;
    /** Callback functions */
    onStart?: () => void;
    onEnd?: (success?: boolean) => void;
}

export function PDFActionButton({
    type,
    url,
    title = 'PDF Document',
    size = 24,
    color,
    style,
    onStart,
    onEnd,
}: PDFActionButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isLoading, setIsLoading] = useState(false);

    const defaultColor = color || (isDark ? '#60A5FA' : '#3B82F6');
    const iconName = type === 'view' ? 'eye' : 'download';

    const handleAction = async () => {
        if (!url) {
            Alert.alert('Error', 'No PDF URL provided');
            return;
        }

        setIsLoading(true);
        onStart?.();

        try {
            if (type === 'view') {
                const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

                await WebBrowser.openBrowserAsync(googleDocsUrl, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                    toolbarColor: isDark ? '#111827' : '#F9FAFB',
                    controlsColor: isDark ? '#60A5FA' : '#3B82F6',
                    dismissButtonStyle: 'close',
                    showTitle: true,
                });

                onEnd?.(true);
            } else {
                const success = await downloadFile(url);
                onEnd?.(success);

                if (success) {
                    Alert.alert('Success', 'PDF downloaded successfully');
                }
            }
        } catch (error) {
            console.error(`Error ${type}ing PDF:`, error);
            Alert.alert('Error', `Failed to ${type} PDF`);
            onEnd?.(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.actionButton, style]}
            onPress={handleAction}
            disabled={!url || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={defaultColor} />
            ) : (
                <Ionicons name={iconName} size={size} color={url ? defaultColor : '#9CA3AF'} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
    },
    buttonSpacing: {
        marginRight: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// Export all components
export default PDFViewer; 