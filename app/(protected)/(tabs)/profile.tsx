import { Modal } from '@/components/ui/Modal';
import { useSession } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
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