import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { AnimatedTabButton } from '@/components/ui/AnimatedTabButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from '@/constants/Layout';
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
            // Floating tab bar design for iOS
            backgroundColor: tabBarBackgroundColor,
            paddingTop: 28,
            height: TAB_BAR_HEIGHT,
            marginHorizontal: 10,
            marginBottom: TAB_BAR_BOTTOM_MARGIN,
            borderRadius: 55,
            paddingHorizontal: 12,
            position: 'absolute',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.12,
            shadowRadius: 20,
          },
          default: {
            // Floating tab bar design for Android and web
            backgroundColor: tabBarBackgroundColor,
            paddingTop: 23,
            height: TAB_BAR_HEIGHT,
            marginHorizontal: 10,
            marginBottom: TAB_BAR_BOTTOM_MARGIN,
            borderRadius: 55,
            paddingHorizontal: 20,
            position: 'absolute',
            elevation: 10,
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
