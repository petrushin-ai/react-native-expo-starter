import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { AnimatedTabButton } from '@/components/ui/AnimatedTabButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tabBarBackgroundColor = useThemeColor({}, 'tabBarBackground');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        headerShown: false,
        tabBarButton: AnimatedTabButton,
        tabBarStyle: Platform.select({
          ios: {
            // Use solid background on iOS for better theme support
            backgroundColor: tabBarBackgroundColor,
            paddingTop: 18,
            height: 100, // Increased height for labels and better tap targets
          },
          default: {
            // Use solid background color for Android and web
            backgroundColor: tabBarBackgroundColor,
            paddingTop: 22,
            height: 85, // Increased height for labels and better tap targets
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          title: 'Charts',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          title: 'UI',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.3x3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
