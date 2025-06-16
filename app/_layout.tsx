import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { SessionProvider, useSession } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function RootNavigator() {
  const { session, isAuthEnabled } = useSession();

  return (
    <Stack>
      {isAuthEnabled ? (
        <>
          <Stack.Protected guard={!!session}>
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!session}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          </Stack.Protected>
        </>
      ) : (
        // When auth is disabled, show protected content directly (which includes tabs)
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessionProvider>
  );
}
