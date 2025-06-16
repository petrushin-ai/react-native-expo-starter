import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabBarBackground() {
  const { colorScheme } = useTheme();
  const backgroundColor = useThemeColor({}, 'tabBarBackground');

  if (Platform.OS === 'ios') {
    // For iOS, use a combination of blur and solid background for better dark mode support
    return (
      <>
        <BlurView
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          intensity={colorScheme === 'dark' ? 80 : 100}
          style={StyleSheet.absoluteFill}
        />
        {colorScheme === 'dark' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(26, 26, 26, 0.85)',
              }
            ]}
          />
        )}
      </>
    );
  }

  // Use solid background for Android and web with proper theming
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
