// Auth configuration that can be extended for different auth providers
export const authConfig = {
    // Check if auth is enabled from environment variable
    isAuthEnabled: process.env.EXPO_PUBLIC_AUTH_ENABLED === 'true',

    // Default credentials for development/demo purposes
    // In production, these would be replaced with actual auth provider integration
    credentials: {
        username: process.env.EXPO_PUBLIC_AUTH_USERNAME || 'admin',
        password: process.env.EXPO_PUBLIC_AUTH_PASSWORD || 'password123',
    },

    // Additional auth configuration can be added here
    // For example: OAuth providers, API endpoints, etc.
}; 