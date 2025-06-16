import { useSession } from '@/contexts/AuthContext';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function ProtectedLayout() {
    const { session, isLoading, isAuthEnabled } = useSession();

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

    // Render the protected routes
    return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
}); 