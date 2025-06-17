import { CustomDrawerContent } from '@/components/ui/CustomDrawerContent';
import { PermissionModal } from '@/components/ui/PermissionModal';
import { useSession } from '@/contexts/AuthContext';
import { useStartupPermissions } from '@/hooks/useStartupPermissions';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function ProtectedLayout() {
    const { session, isLoading, isAuthEnabled } = useSession();
    const { width } = useWindowDimensions();
    const {
        permissionModal,
        closePermissionModal,
        handleOpenSettings,
    } = useStartupPermissions();

    // Show loading screen while checking authentication state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Only require authentication if auth is enabled
    if (isAuthEnabled && !session) {
        // Redirect to sign-in if not authenticated
        return <Redirect href="/sign-in" />;
    }

    // Render the protected routes with drawer navigation
    return (
        <>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Drawer
                    drawerContent={(props) => <CustomDrawerContent {...props} />}
                    screenOptions={{
                        headerShown: false,
                        drawerPosition: 'right',
                        drawerType: 'front',
                        drawerStyle: {
                            width: width * 0.8, // 80% of screen width
                            backgroundColor: 'transparent',
                        },
                        overlayColor: 'rgba(0, 0, 0, 0.4)',
                        swipeEnabled: true,
                        swipeEdgeWidth: 50,
                        swipeMinDistance: 20,
                    }}
                >
                    <Drawer.Screen
                        name="(tabs)"
                        options={{
                            drawerLabel: 'Main',
                            title: 'Home',
                        }}
                    />
                    <Drawer.Screen
                        name="calendar"
                        options={{
                            drawerLabel: 'Calendar',
                            title: 'Calendar',
                        }}
                    />
                </Drawer>
            </GestureHandlerRootView>

            <PermissionModal
                visible={permissionModal.visible}
                onClose={closePermissionModal}
                title={permissionModal.title}
                message={permissionModal.message}
                permissionType={permissionModal.permissionType}
                onOpenSettings={handleOpenSettings}
            />
        </>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
}); 