import { useSession } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function SignIn() {
    const { signIn } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleSignIn = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }

        setIsLoading(true);
        try {
            const success = await signIn(username, password);
            if (success) {
                // Navigation will be handled automatically by the protected route
                router.replace('/');
            } else {
                Alert.alert('Error', 'Invalid username or password');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred during sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark && styles.containerDark]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={[styles.title, isDark && styles.textDark]}>Sign In</Text>

                <View style={styles.form}>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark]}
                        placeholder="Username"
                        placeholderTextColor={isDark ? '#999' : '#666'}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />

                    <TextInput
                        style={[styles.input, isDark && styles.inputDark]}
                        placeholder="Password"
                        placeholderTextColor={isDark ? '#999' : '#666'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={[styles.hint, isDark && styles.textDark]}>
                    Use the credentials configured in your environment
                </Text>
            </View>
        </KeyboardAvoidingView>
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    textDark: {
        color: '#fff',
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        fontSize: 16,
        color: '#333',
    },
    inputDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
        color: '#fff',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    hint: {
        marginTop: 20,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
}); 