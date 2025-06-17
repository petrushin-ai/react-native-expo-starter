import { useColorScheme } from '@/hooks/useColorScheme';
import { Avatar } from '@kolking/react-native-avatar';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

export interface AvatarProps {
    // Core props
    source?: { uri: string } | number;
    name?: string;
    email?: string;

    // Size and appearance
    size?: number | 'small' | 'medium' | 'large';
    borderRadius?: number;
    colorize?: boolean;

    // Badge options
    badge?: string | number | React.ReactNode;
    badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    badgeSize?: number;
    badgeColor?: string;

    // Styling
    containerStyle?: ViewStyle;

    // Accessibility
    accessible?: boolean;
    accessibilityLabel?: string;
}

export function CustomAvatar({
    source,
    name,
    email,
    size = 'medium',
    borderRadius,
    colorize = false,
    badge,
    badgePosition = 'top-right',
    badgeSize,
    badgeColor,
    containerStyle,
    accessible = true,
    accessibilityLabel,
}: AvatarProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Convert size prop to number
    const getAvatarSize = (): number => {
        if (typeof size === 'number') return size;
        switch (size) {
            case 'small':
                return 32;
            case 'large':
                return 64;
            default: // medium
                return 48;
        }
    };

    const avatarSize = getAvatarSize();
    const calculatedBorderRadius = borderRadius !== undefined ? borderRadius : avatarSize / 2;
    const calculatedBadgeSize = badgeSize || Math.max(16, avatarSize * 0.3);

    // Generate initials from name
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate color from name for colorize option
    const generateColorFromName = (name: string): string => {
        if (!colorize || !name) return isDark ? '#374151' : '#6B7280';

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colors = [
            '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
            '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
            '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
            '#EC4899', '#F43F5E'
        ];

        return colors[Math.abs(hash) % colors.length];
    };

    // Prepare avatar props
    const avatarProps = {
        source: source,
        name: name,
        email: email,
        size: avatarSize,
        borderRadius: calculatedBorderRadius,
        backgroundColor: name && colorize ? generateColorFromName(name) : (isDark ? '#374151' : '#E5E7EB'),
        textStyle: {
            color: '#FFFFFF',
            fontSize: avatarSize * 0.4,
            fontWeight: '600' as const,
        },
    };

    // Badge positioning styles
    const getBadgePositionStyle = () => {
        const offset = 2;
        switch (badgePosition) {
            case 'top-left':
                return { top: offset, left: offset };
            case 'bottom-left':
                return { bottom: offset, left: offset };
            case 'bottom-right':
                return { bottom: offset, right: offset };
            default: // top-right
                return { top: offset, right: offset };
        }
    };

    const renderBadge = () => {
        if (!badge) return null;

        const badgeStyle = [
            styles.badge,
            {
                width: calculatedBadgeSize,
                height: calculatedBadgeSize,
                borderRadius: calculatedBadgeSize / 2,
                backgroundColor: badgeColor || (isDark ? '#EF4444' : '#DC2626'),
            },
            getBadgePositionStyle(),
        ];

        // If badge is a React node, render it directly
        if (React.isValidElement(badge)) {
            return (
                <View style={badgeStyle}>
                    {badge}
                </View>
            );
        }

        // If badge is a number, show it with appropriate formatting
        if (typeof badge === 'number') {
            const displayText = badge > 99 ? '99+' : badge.toString();
            return (
                <View style={badgeStyle}>
                    <Text style={[styles.badgeText, { fontSize: calculatedBadgeSize * 0.5 }]}>
                        {displayText}
                    </Text>
                </View>
            );
        }

        // If badge is a string (emoji or text)
        return (
            <View style={badgeStyle}>
                <Text style={[styles.badgeText, { fontSize: calculatedBadgeSize * 0.6 }]}>
                    {badge}
                </Text>
            </View>
        );
    };

    return (
        <View
            style={[styles.container, containerStyle]}
            accessible={accessible}
            accessibilityLabel={accessibilityLabel || `Avatar for ${name || 'user'}`}
        >
            <Avatar {...avatarProps} />
            {renderBadge()}
        </View>
    );
}

// Default export for easier imports
export { CustomAvatar as Avatar };

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
    },
}); 