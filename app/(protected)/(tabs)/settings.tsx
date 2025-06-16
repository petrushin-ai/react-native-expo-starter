import { Switch } from '@/components/ui/Switch';
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
import React, { useState } from 'react';
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
    const {
        expoPushToken,
        devicePushToken,
        isLoadingToken,
        tokenError,
        requestPermissions: requestNotificationPermissions,
        sendTestNotification,
        isSupported: notificationsSupported
    } = useNotificationContext();

    const {
        permissions,
        isLoading: permissionsLoading,
        requestPermission,
        resetPermissions
    } = usePermissions();

    const [isSendingTest, setIsSendingTest] = useState(false);

    const handleNotificationPermissionToggle = async () => {
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

    // Get list of enabled permissions from config
    const enabledPermissions = (Object.keys(permissionsConfig) as Array<keyof PermissionConfig>)
        .filter(key => permissionsConfig[key]);

    return (
        <ScrollView style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.content}>
                <Text style={[styles.title, isDark && styles.textDark]}>Settings</Text>

                {/* Push Notifications Section */}
                {notificationsSupported && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                            Push Notifications
                        </Text>

                        <View style={styles.permissionRow}>
                            <View style={styles.permissionInfo}>
                                <Text style={[styles.permissionName, isDark && styles.textDark]}>
                                    Enable Notifications
                                </Text>
                                <Text style={[styles.permissionDescription, isDark && styles.textDark]}>
                                    Receive push notifications for important updates
                                </Text>
                            </View>
                            <Switch
                                value={!!expoPushToken}
                                onValueChange={handleNotificationPermissionToggle}
                                disabled={isLoadingToken}
                            />
                        </View>

                        {isLoadingToken && (
                            <ActivityIndicator size="small" color="#2563EB" style={styles.loader} />
                        )}

                        {tokenError && (
                            <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                                Error: {tokenError}
                            </Text>
                        )}

                        {expoPushToken && (
                            <>
                                <View style={styles.tokenContainer}>
                                    <Text style={[styles.tokenLabel, isDark && styles.textDark]}>
                                        Push Token:
                                    </Text>
                                    <Text
                                        style={[styles.tokenValue, isDark && styles.textDark]}
                                        numberOfLines={2}
                                        ellipsizeMode="middle"
                                    >
                                        {expoPushToken}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.testButton, isSendingTest && styles.testButtonDisabled]}
                                    onPress={handleSendTestNotification}
                                    disabled={isSendingTest}
                                >
                                    {isSendingTest ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.testButtonText}>Send Test Notification</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {permissionsDebugMode && devicePushToken && (
                            <View style={styles.debugSection}>
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
                                    <TouchableOpacity
                                        style={styles.resetButton}
                                        onPress={resetPermissions}
                                    >
                                        <Text style={styles.resetButtonText}>Reset All Permissions</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
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
    loader: {
        marginVertical: 16,
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        marginTop: 8,
    },
    errorTextDark: {
        color: '#FF6B6B',
    },
    tokenContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    tokenLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    tokenValue: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: '#666',
    },
    testButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    testButtonDisabled: {
        opacity: 0.6,
    },
    testButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    debugSection: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    debugText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: '#666',
        marginBottom: 4,
    },
    debugInfo: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    resetButton: {
        backgroundColor: '#6B7280',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
}); 