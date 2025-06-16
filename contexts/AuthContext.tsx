import { authConfig } from '@/constants/authConfig';
import { useStorageState } from '@/hooks/useStorageState';
import { createContext, use, type PropsWithChildren } from 'react';

interface AuthContextType {
    signIn: (username: string, password: string) => Promise<boolean>;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
    isAuthEnabled: boolean;
}

const AuthContext = createContext<AuthContextType>({
    signIn: async () => false,
    signOut: () => null,
    session: null,
    isLoading: false,
    isAuthEnabled: false,
});

// This hook can be used to access the user info.
export function useSession() {
    const value = use(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }

    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const isAuthEnabled = authConfig.isAuthEnabled;

    const signIn = async (username: string, password: string): Promise<boolean> => {
        // This is a simple implementation that can be replaced with any auth provider
        // For now, we're using credentials from config
        if (username === authConfig.credentials.username &&
            password === authConfig.credentials.password) {
            // Generate a simple session token (in production, this would come from your auth server)
            const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setSession(sessionToken);
            return true;
        }
        return false;
    };

    const signOut = () => {
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                session,
                isLoading,
                isAuthEnabled,
            }}>
            {children}
        </AuthContext.Provider>
    );
} 