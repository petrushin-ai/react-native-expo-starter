import { useSession } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
    const { isAuthEnabled, session, isLoading } = useSession();

    // Show loading while checking auth state
    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // If auth is enabled and no session, redirect to sign-in
    if (isAuthEnabled && !session) {
        return <Redirect href="/sign-in" />;
    }

    // Otherwise, redirect to protected content
    return <Redirect href="/(protected)" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
}); 