import * as SplashScreenAPI from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

interface SplashScreenProps {
    onFinish: () => void;
    isReady: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SplashScreen({ onFinish, isReady }: SplashScreenProps) {
    const lottieRef = useRef<LottieView>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [isLayoutReady, setLayoutReady] = useState(false);

    useEffect(() => {
        // Auto-play the Lottie animation
        lottieRef.current?.play();
    }, []);

    const onLayout = useCallback(async () => {
        try {
            // Hide the native splash screen when our custom one is ready
            await SplashScreenAPI.hideAsync();
        } catch (e) {
            console.warn('Error hiding splash screen:', e);
        } finally {
            setLayoutReady(true);
        }
    }, []);

    useEffect(() => {
        if (isReady && isLayoutReady) {
            // Fade out animation before calling onFinish
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }
    }, [isReady, isLayoutReady, fadeAnim, onFinish]);

    return (
        <Animated.View
            style={[styles.container, { opacity: fadeAnim }]}
            onLayout={onLayout}
            pointerEvents="none"
        >
            <View style={styles.content}>
                <LottieView
                    ref={lottieRef}
                    style={styles.animation}
                    source={require('../../assets/lottie/splash.lottie')}
                    autoPlay
                    loop
                    resizeMode="contain"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.appName}>React Native Expo</Text>
                    <Text style={styles.subtitle}>Loading your experience...</Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    animation: {
        width: Math.min(screenWidth * 0.6, 250),
        height: Math.min(screenWidth * 0.6, 250),
    },
    textContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    appName: {
        fontSize: Math.min(screenWidth * 0.08, 32),
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#666666',
        marginTop: 12,
        textAlign: 'center',
        fontWeight: '400',
    },
}); 