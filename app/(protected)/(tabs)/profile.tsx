import { Avatar } from '@/components/ui/Avatar';
import { BurgerMenuButton } from '@/components/ui/BurgerMenuButton';
import { Modal } from '@/components/ui/Modal';
import { useSession } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
    const { signOut, session, isAuthEnabled } = useSession();
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation();
    const drawerStatus = useDrawerStatus();
    const isDrawerOpen = drawerStatus === 'open';

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

    const handleBurgerPress = () => {
        if (isDrawerOpen) {
            (navigation as any).closeDrawer();
        } else {
            (navigation as any).openDrawer();
        }
    };

    return (
        <>
            <ScrollView style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.content}>
                    {/* Profile Header Section */}
                    <View style={styles.profileHeaderSection}>
                        <Avatar
                            size="large"
                            name="User Profile"
                            colorize
                            badge={isAuthEnabled && session ? "✓" : "!"}
                            badgeColor={isAuthEnabled && session ? "#22C55E" : "#F59E0B"}
                            badgePosition="bottom-right"
                        />
                        <Text style={[styles.profileName, isDark && styles.textDark]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.profileSubtitle, isDark && styles.textDark]}>
                            {isAuthEnabled ? 'Account Manager' : 'Guest User'}
                        </Text>
                    </View>

                    {/* Account Status Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                            Account Status
                        </Text>

                        <View style={[styles.statusCard, isDark && styles.statusCardDark]}>
                            <View style={styles.statusHeader}>
                                <Ionicons
                                    name={isAuthEnabled ? "shield-checkmark" : "shield-outline"}
                                    size={24}
                                    color={isAuthEnabled ? "#22C55E" : "#F59E0B"}
                                />
                                <View style={styles.statusInfo}>
                                    <Text style={[styles.statusTitle, isDark && styles.textDark]}>
                                        Authentication
                                    </Text>
                                    <Text style={[styles.statusValue, isDark && styles.textDark]}>
                                        {isAuthEnabled ? 'Enabled' : 'Disabled'}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    isAuthEnabled ? styles.statusBadgeActive : styles.statusBadgeInactive
                                ]}>
                                    <Text style={[
                                        styles.statusBadgeText,
                                        isAuthEnabled ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive
                                    ]}>
                                        {isAuthEnabled ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            </View>

                            {isAuthEnabled && session && (
                                <View style={styles.sessionInfo}>
                                    <View style={styles.sessionRow}>
                                        <Ionicons name="key" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                        <Text style={[styles.sessionLabel, isDark && styles.textDark]}>Session ID</Text>
                                    </View>
                                    <Text style={[styles.sessionValue, isDark && styles.textDark]} numberOfLines={1}>
                                        {session.substring(0, 20)}...
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Quick Actions Section */}
                    {isAuthEnabled && session && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                                Quick Actions
                            </Text>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.signOutAction, isDark && styles.signOutActionDark]}
                                onPress={handleSignOut}
                            >
                                <View style={styles.actionButtonContent}>
                                    <Ionicons name="log-out" size={24} color="#FF3B30" />
                                    <View style={styles.actionButtonText}>
                                        <Text style={[styles.actionButtonTitle, styles.signOutTitle]}>Sign Out</Text>
                                        <Text style={[styles.actionButtonDescription, isDark && styles.textDark]}>
                                            End your current session securely
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Settings Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                            App Settings
                        </Text>

                        <View style={styles.featureGrid}>
                            <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                                <Ionicons name="color-palette" size={28} color="#2563EB" style={styles.featureIcon} />
                                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Theme</Text>
                                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                                    {isDark ? 'Dark Mode' : 'Light Mode'}
                                </Text>
                            </View>

                            <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                                <Ionicons name="notifications" size={28} color="#2563EB" style={styles.featureIcon} />
                                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Notifications</Text>
                                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                                    Push notifications
                                </Text>
                            </View>

                            <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                                <Ionicons name="language" size={28} color="#2563EB" style={styles.featureIcon} />
                                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Language</Text>
                                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                                    English (US)
                                </Text>
                            </View>

                            <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                                <Ionicons name="shield-checkmark" size={28} color="#2563EB" style={styles.featureIcon} />
                                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Privacy</Text>
                                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                                    Security settings
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* System Information Section */}
                    {!isAuthEnabled && (
                        <View style={[styles.systemInfoCard, isDark && styles.systemInfoCardDark]}>
                            <View style={styles.systemInfoHeader}>
                                <Ionicons name="information-circle" size={24} color="#F59E0B" />
                                <Text style={[styles.systemInfoTitle, isDark && styles.textDark]}>
                                    System Information
                                </Text>
                            </View>
                            <Text style={[styles.systemInfoText, isDark && styles.textDark]}>
                                Authentication is currently disabled.{'\n'}
                                Set EXPO_PUBLIC_AUTH_ENABLED=true in your environment to enable it.
                            </Text>
                        </View>
                    )}

                    {/* App Information */}
                    <View style={[styles.appInfoSection, isDark && styles.appInfoSectionDark]}>
                        <Text style={[styles.appInfoTitle, isDark && styles.textDark]}>
                            React Native Expo Bootstrap
                        </Text>
                        <Text style={[styles.appInfoVersion, isDark && styles.textDark]}>
                            Version 1.0.0
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <BurgerMenuButton
                onPress={handleBurgerPress}
                isDrawerOpen={isDrawerOpen}
            />

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
        marginTop: 45,
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
    textDark: {
        color: '#fff',
    },

    // Profile Header Section
    profileHeaderSection: {
        alignItems: 'center',
        marginBottom: 40,
        paddingVertical: 20,
    },
    profileName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 4,
    },
    profileSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },

    // Section Styling
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },

    // Status Card
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusCardDark: {
        backgroundColor: '#2d2d2d',
        borderColor: '#374151',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusInfo: {
        flex: 1,
        marginLeft: 12,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusBadgeActive: {
        backgroundColor: '#DCFCE7',
    },
    statusBadgeInactive: {
        backgroundColor: '#FEF3C7',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadgeTextActive: {
        color: '#16A34A',
    },
    statusBadgeTextInactive: {
        color: '#D97706',
    },
    sessionInfo: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    sessionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sessionLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    sessionValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'monospace',
    },

    // Action Buttons
    actionButton: {
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    signOutAction: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FFE4E1',
        paddingVertical: 18,
        paddingHorizontal: 16,
        minHeight: 80,
        justifyContent: 'center',
        shadowColor: '#FF3B30',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    signOutActionDark: {
        backgroundColor: '#2d2d2d',
        borderColor: '#4B1113',
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtonText: {
        marginLeft: 16,
        flex: 1,
    },
    actionButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    signOutTitle: {
        color: '#FF3B30',
    },
    actionButtonDescription: {
        fontSize: 14,
        color: '#666',
    },

    // Feature Grid (Settings)
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    featureCardDark: {
        backgroundColor: '#2d2d2d',
        borderColor: '#374151',
    },
    featureIcon: {
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },

    // System Information Card
    systemInfoCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        marginBottom: 20,
    },
    systemInfoCardDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    systemInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    systemInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    systemInfoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },

    // App Information Section
    appInfoSection: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20,
    },
    appInfoSectionDark: {
        // No additional styling needed
    },
    appInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    appInfoVersion: {
        fontSize: 14,
        color: '#666',
    },
}); 