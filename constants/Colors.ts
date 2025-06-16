/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Navigation specific colors
    tabBarBackground: '#ffffff',
    // Additional semantic colors for better theming
    surface: '#f8f9fa',
    border: '#e9ecef',
    card: '#ffffff',
    notification: '#ff6b35',
    error: '#dc3545',
    warning: '#ffc107',
    success: '#28a745',
    muted: '#6c757d',
    placeholder: '#adb5bd',
    // Settings specific colors
    settingsBackground: '#f8f9fa',
    settingsCard: '#ffffff',
    settingsBorder: '#e9ecef',
    switchTrackTrue: tintColorLight,
    switchTrackFalse: '#e9ecef',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Navigation specific colors
    tabBarBackground: '#1a1a1a',
    // Additional semantic colors for better theming
    surface: '#1e2124',
    border: '#2c2f33',
    card: '#2c2f33',
    notification: '#ff6b35',
    error: '#ff6b6b',
    warning: '#ffd93d',
    success: '#6bcf7f',
    muted: '#9BA1A6',
    placeholder: '#6c757d',
    // Settings specific colors
    settingsBackground: '#151718',
    settingsCard: '#2c2f33',
    settingsBorder: '#404040',
    switchTrackTrue: tintColorDark,
    switchTrackFalse: '#404040',
  },
};
