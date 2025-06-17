import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import CustomSplashScreen from '@/components/ui/SplashScreen';
import { SessionProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SplashProvider, useSplash } from '@/contexts/SplashContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Configure Reanimated logger to suppress warnings about shared value access during render
// This is a backup solution - the primary fix is removing shared values from useEffect dependency arrays
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disable strict mode to suppress the shared value warnings
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const { colorScheme } = useTheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function AppContent() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { setSplashFinished } = useSplash();

  useEffect(() => {
    async function prepare() {
      try {
        // Add any additional preparation logic here
        // For example: preload data, authenticate user, etc.

        // Simulate some loading time (remove in production if not needed)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    if (loaded) {
      prepare();
    }
  }, [loaded]);

  const onSplashFinish = useCallback(() => {
    setShowSplash(false);
    // Notify all components that the splash screen has finished
    setSplashFinished(true);
  }, [setSplashFinished]);

  if (!loaded) {
    // Return null while fonts are loading
    return null;
  }

  return (
    <CustomThemeProvider>
      <SessionProvider>
        <NotificationProvider>
          <ThemedApp />
        </NotificationProvider>
      </SessionProvider>
      {showSplash && (
        <CustomSplashScreen
          onFinish={onSplashFinish}
          isReady={appIsReady}
        />
      )}
    </CustomThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SplashProvider>
      <AppContent />
    </SplashProvider>
  );
}
