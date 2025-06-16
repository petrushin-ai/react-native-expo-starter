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
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Example: Using native assets for custom back button
            <Stack.Screen 
                name="details" 
                options={{
                    // On iOS, this will use the native asset from the asset catalog
                    // On Android, you'll need to provide a fallback
                    headerBackImageSource: { 
                        uri: "chevron-left", 
                        width: 24, 
                        height: 24 
                    },
                }} 
            />
            */}
        </Stack>
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
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
}); 