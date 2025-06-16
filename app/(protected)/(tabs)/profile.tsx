import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import {
    PermissionConfig,
    permissionDescriptions,
    permissionDisplayNames,
    permissionsConfig,
    permissionsDebugMode
} from '@/constants/permissionsConfig';
import { useSession } from '@/contexts/AuthContext';
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
    View
} from 'react-native';

export default function ProfileScreen() {
    const { signOut, session, isAuthEnabled } = useSession();
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const { permissions, isLoading: permissionsLoading, requestPermission, resetPermissions, checkPermissions } = usePermissions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleSignOut = () => {
        setShowSignOutModal(true);
    };

    const confirmSignOut = () => {
        setShowSignOutModal(false);
        // Small delay to ensure modal closes before navigation
        setTimeout(() => {
            signOut();
            // Navigation will be handled automatically by the protected route
        }, 100);
    };

    const handlePermissionToggle = async (permission: keyof PermissionConfig) => {
        const currentStatus = permissions[permission];

        if (currentStatus === 'granted') {
            // Can't revoke permissions programmatically, guide user to settings
            Alert.alert(
                'Disable Permission',
                `To disable ${permissionDisplayNames[permission]}, please go to your device settings.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
        } else {
            // Request permission
            await requestPermission(permission);
        }
    };

    // Get list of enabled permissions from config
    const enabledPermissions = (Object.keys(permissionsConfig) as Array<keyof PermissionConfig>)
        .filter(key => permissionsConfig[key]);

    return (
        <>
            <ScrollView style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.content}>
                    <Text style={[styles.title, isDark && styles.textDark]}>Profile</Text>

                    {/* Authentication Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Authentication</Text>

                        <View style={styles.infoRow}>
                            <Text style={[styles.label, isDark && styles.textDark]}>Status</Text>
                            <Text style={[styles.value, isDark && styles.textDark]}>
                                {isAuthEnabled ? 'Enabled' : 'Disabled'}
                            </Text>
                        </View>

                        {isAuthEnabled && session && (
                            <>
                                <View style={styles.infoRow}>
                                    <Text style={[styles.label, isDark && styles.textDark]}>Session</Text>
                                    <Text style={[styles.value, isDark && styles.textDark]} numberOfLines={1}>
                                        {session.substring(0, 20)}...
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.signOutButton}
                                    onPress={handleSignOut}
                                >
                                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Permissions Section */}
                    {enabledPermissions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Permissions</Text>

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
                                        <>
                                            <View style={styles.debugSection}>
                                                <Text style={[styles.debugTitle, isDark && styles.textDark]}>
                                                    Debug Mode - Environment Config
                                                </Text>
                                                {(Object.keys(permissionsConfig) as Array<keyof PermissionConfig>).map((key) => (
                                                    <Text key={key} style={[styles.debugText, isDark && styles.textDark]}>
                                                        EXPO_PUBLIC_PERMISSIONS_{key.toUpperCase()}: {permissionsConfig[key] ? 'true' : 'false'}
                                                    </Text>
                                                ))}
                                            </View>

                                            <TouchableOpacity
                                                style={styles.resetButton}
                                                onPress={resetPermissions}
                                            >
                                                <Text style={styles.resetButtonText}>Reset All Permissions</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            )}
                        </View>
                    )}

                    {!isAuthEnabled && (
                        <View style={styles.noteContainer}>
                            <Text style={[styles.note, isDark && styles.textDark]}>
                                Authentication is currently disabled.{'\n'}
                                Set EXPO_PUBLIC_AUTH_ENABLED=true in your environment to enable it.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={showSignOutModal}
                onClose={() => setShowSignOutModal(false)}
                title="Sign Out"
                message="Are you sure you want to sign out of your account?"
                type="warning"
                primaryButtonText="Sign Out"
                secondaryButtonText="Cancel"
                onPrimaryPress={confirmSignOut}
                onSecondaryPress={() => setShowSignOutModal(false)}
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    signOutButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    signOutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
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
    debugSection: {
        marginTop: 20,
        padding: 16,
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
    noteContainer: {
        marginTop: 40,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    note: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
}); 