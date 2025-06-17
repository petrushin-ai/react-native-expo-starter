import { BurgerMenuButton } from '@/components/ui/BurgerMenuButton';
import { Switch } from '@/components/ui/Switch';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import {
    PermissionConfig,
    permissionDescriptions,
    permissionDisplayNames,
    permissionsConfig,
    permissionsDebugMode
} from '@/constants/permissionsConfig';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePermissions } from '@/hooks/usePermissions';
import { useStartupPermissions } from '@/hooks/useStartupPermissions';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation();
    const drawerStatus = useDrawerStatus();
    const isDrawerOpen = drawerStatus === 'open';
    const {
        expoPushToken,
        devicePushToken,
        isLoadingToken,
        tokenError,
        notificationPermissionStatus,
        requestPermissions: requestNotificationPermissions,
        checkPermissions: checkNotificationPermissions,
        sendTestNotification,
        isSupported: notificationsSupported
    } = useNotificationContext();

    const {
        permissions,
        isLoading: permissionsLoading,
        requestPermission,
        resetPermissions,
        checkPermissions
    } = usePermissions();

    const {
        recheckPermissions
    } = useStartupPermissions();

    const [isSendingTest, setIsSendingTest] = useState(false);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);

    // Refresh permissions when screen comes into focus (less frequent than before)
    useEffect(() => {
        const refreshPermissions = () => {
            checkPermissions();
            checkNotificationPermissions();
        };

        // Check on mount
        refreshPermissions();

        // Check again when app becomes active (handled by contexts, but good to be explicit)
        // No more frequent polling here since contexts handle it efficiently
    }, [checkPermissions, checkNotificationPermissions]);

    const handleBurgerPress = () => {
        if (isDrawerOpen) {
            (navigation as any).closeDrawer();
        } else {
            (navigation as any).openDrawer();
        }
    };

    const handleRequestNotificationPermission = async () => {
        setIsRequestingPermission(true);
        try {
            const granted = await requestNotificationPermissions();
            if (!granted) {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings to receive push notifications.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Settings', onPress: () => {
                                if (Platform.OS === 'ios') {
                                    Linking.openURL('app-settings:');
                                } else {
                                    Linking.openSettings();
                                }
                            }
                        },
                    ]
                );
            }
        } finally {
            setIsRequestingPermission(false);
        }
    };

    const handleSendTestNotification = async () => {
        setIsSendingTest(true);
        try {
            await sendTestNotification();
        } catch (error) {
            Alert.alert('Error', 'Failed to send test notification');
        } finally {
            setIsSendingTest(false);
        }
    };

    const handlePermissionToggle = async (permission: keyof PermissionConfig) => {
        const currentStatus = permissions[permission];

        if (currentStatus === 'granted') {
            Alert.alert(
                'Disable Permission',
                `To disable ${permissionDisplayNames[permission]}, please go to your device settings.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
        } else {
            await requestPermission(permission);
        }
    };

    const handleRecheckPermissions = async () => {
        Alert.alert(
            'Recheck Permissions',
            'This will check all app permissions again and may show permission requests if needed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async () => {
                        try {
                            await recheckPermissions();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to recheck permissions');
                        }
                    }
                },
            ]
        );
    };

    // Get list of enabled permissions from config
    const enabledPermissions = (Object.keys(permissionsConfig) as Array<keyof PermissionConfig>)
        .filter(key => permissionsConfig[key]);

    return (
        <>
            <ScrollView style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.content}>
                    <Text style={[styles.title, isDark && styles.textDark]}>Settings</Text>

                    {/* Theme Section */}
                    <ThemeSelector />

                    {/* Push Notifications Section */}
                    {notificationsSupported && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                Push Notifications
                            </Text>

                            {notificationPermissionStatus !== 'granted' ? (
                                <>
                                    <Text style={[styles.permissionDescription, isDark && styles.textDark, styles.notificationPrompt]}>
                                        Enable push notifications to receive important updates and reminders.
                                    </Text>

                                    <TouchableOpacity
                                        style={[styles.enableButton, isRequestingPermission && styles.enableButtonDisabled]}
                                        onPress={handleRequestNotificationPermission}
                                        disabled={isRequestingPermission || isLoadingToken}
                                    >
                                        {isRequestingPermission || isLoadingToken ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.enableButtonText}>Enable Notifications</Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={styles.notificationStatus}>
                                        <Text style={[styles.statusText, isDark && styles.textDark]}>
                                            ✓ Notifications Enabled
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            if (Platform.OS === 'ios') {
                                                Linking.openURL('app-settings:');
                                            } else {
                                                Linking.openSettings();
                                            }
                                        }}>
                                            <Text style={[styles.manageText, isDark && styles.manageDark]}>
                                                Manage in Settings
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.testButton, isSendingTest && styles.testButtonDisabled]}
                                        onPress={handleSendTestNotification}
                                        disabled={isSendingTest}
                                    >
                                        {isSendingTest ? (
                                            <ActivityIndicator size="small" color="#2563EB" />
                                        ) : (
                                            <Text style={[styles.testButtonText, isDark && styles.testButtonTextDark]}>
                                                Send Test Notification
                                            </Text>
                                        )}
                                    </TouchableOpacity>

                                    {permissionsDebugMode && expoPushToken && (
                                        <View style={[styles.debugSection, isDark && styles.debugSectionDark]}>
                                            <Text style={[styles.debugTitle, isDark && styles.textDark]}>
                                                Expo Push Token:
                                            </Text>
                                            <Text style={[styles.debugText, isDark && styles.textDark]}>
                                                {expoPushToken}
                                            </Text>
                                        </View>
                                    )}

                                    {isLoadingToken ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color="#2563EB" />
                                            <Text style={[styles.loadingText, isDark && styles.textDark]}>
                                                Generating push token...
                                            </Text>
                                        </View>
                                    ) : null}
                                </>
                            )}

                            {tokenError && (
                                <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                                    Error: {tokenError}
                                </Text>
                            )}

                            {permissionsDebugMode && devicePushToken && (
                                <View style={[styles.debugSection, isDark && styles.debugSectionDark]}>
                                    <Text style={[styles.debugTitle, isDark && styles.textDark]}>
                                        Device Token:
                                    </Text>
                                    <Text style={[styles.debugText, isDark && styles.textDark]}>
                                        {devicePushToken}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Other Permissions Section */}
                    {enabledPermissions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                App Permissions
                            </Text>

                            {permissionsLoading ? (
                                <ActivityIndicator size="small" color="#2563EB" />
                            ) : (
                                <>
                                    {enabledPermissions.map((permission) => (
                                        <View key={permission} style={styles.permissionRow}>
                                            <View style={styles.permissionInfo}>
                                                <Text style={[styles.permissionName, isDark && styles.textDark]}>
                                                    {permissionDisplayNames[permission]}
                                                </Text>
                                                <Text style={[styles.permissionDescription, isDark && styles.textDark]}>
                                                    {permissionDescriptions[permission]}
                                                </Text>
                                                {permissionsDebugMode && (
                                                    <Text style={[styles.debugInfo, isDark && styles.textDark]}>
                                                        Status: {permissions[permission]}
                                                    </Text>
                                                )}
                                            </View>
                                            <Switch
                                                value={permissions[permission] === 'granted'}
                                                onValueChange={() => handlePermissionToggle(permission)}
                                            />
                                        </View>
                                    ))}

                                    {permissionsDebugMode && (
                                        <View style={styles.debugActions}>
                                            <TouchableOpacity
                                                style={styles.resetButton}
                                                onPress={resetPermissions}
                                            >
                                                <Text style={styles.resetButtonText}>Reset All Permissions</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.recheckButton}
                                                onPress={handleRecheckPermissions}
                                            >
                                                <Text style={styles.recheckButtonText}>Recheck Permissions</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <BurgerMenuButton
                onPress={handleBurgerPress}
                isDrawerOpen={isDrawerOpen}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    content: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        paddingTop: 7,
        color: '#333',
    },
    textDark: {
        color: '#fff',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    permissionInfo: {
        flex: 1,
        marginRight: 16,
    },
    permissionName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    permissionDescription: {
        fontSize: 14,
        color: '#666',
    },
    notificationPrompt: {
        marginBottom: 16,
    },
    enableButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    enableButtonDisabled: {
        opacity: 0.6,
    },
    enableButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    notificationStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    manageText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2563EB',
    },
    manageDark: {
        color: '#6B7280',
    },
    testButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#2563EB',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    testButtonDisabled: {
        opacity: 0.6,
    },
    testButtonText: {
        color: '#2563EB',
        fontSize: 16,
        fontWeight: '500',
    },
    testButtonTextDark: {
        color: '#6B7280',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        marginTop: 8,
    },
    errorTextDark: {
        color: '#EF4444',
    },
    debugSection: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    debugSectionDark: {
        backgroundColor: '#374151',
    },
    debugTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    debugText: {
        fontSize: 10,
        color: '#6B7280',
        fontFamily: 'monospace',
    },
    debugInfo: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        fontStyle: 'italic',
    },
    debugActions: {
        marginTop: 16,
    },
    resetButton: {
        backgroundColor: '#DC2626',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 8,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    recheckButton: {
        backgroundColor: '#059669',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    recheckButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
}); 