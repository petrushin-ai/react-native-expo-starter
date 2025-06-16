import { Redirect } from 'expo-router';

export default function Index() {
    // Always redirect to protected route
    // The protected layout will handle auth checks if enabled
    return <Redirect href="/(protected)" />;
} 