import { Platform } from 'react-native';

/**
 * Floating Tab Bar Layout Constants
 * Centralized configuration for floating tab bar dimensions and spacing
 */

// Tab bar dimensions
export const TAB_BAR_HEIGHT = 110;

// Platform-specific bottom margins for floating effect
export const TAB_BAR_BOTTOM_MARGIN = Platform.select({
    ios: 22,
    default: 25,
}) as number;

// Additional padding for content breathing room
export const ADDITIONAL_CONTENT_PADDING = 10;

// Total bottom padding needed for content to avoid floating tab bar overlap
export const CONTENT_BOTTOM_PADDING = Platform.select({
    ios: TAB_BAR_HEIGHT + 22 + ADDITIONAL_CONTENT_PADDING, // 110 + 22 + 105 = 237px
    default: TAB_BAR_HEIGHT + 25 + ADDITIONAL_CONTENT_PADDING, // 110 + 25 + 105 = 240px
}) as number;

/**
 * Layout utility functions
 */
export const getTabBarSpacing = () => ({
    height: TAB_BAR_HEIGHT,
    bottomMargin: TAB_BAR_BOTTOM_MARGIN,
    contentPadding: CONTENT_BOTTOM_PADDING,
});

/**
 * Safe area compensation for floating tab bar
 * Use this value for paddingBottom or marginBottom in scrollable content
 */
export const FLOATING_TAB_BAR_COMPENSATION = CONTENT_BOTTOM_PADDING; 