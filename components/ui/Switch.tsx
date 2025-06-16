import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Platform, Switch as RNSwitch, SwitchProps } from 'react-native';

interface CustomSwitchProps extends Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
    trackColor?: {
        false: string;
        true: string;
    };
    thumbColor?: string;
}

export function Switch(props: CustomSwitchProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const defaultTrackColor = {
        false: isDark ? '#374151' : '#D1D5DB',
        true: isDark ? '#3B82F6' : '#2563EB',
    };

    const defaultThumbColor = Platform.OS === 'ios'
        ? '#FFFFFF'
        : props.value
            ? '#FFFFFF'
            : isDark ? '#6B7280' : '#F3F4F6';

    return (
        <RNSwitch
            {...props}
            trackColor={props.trackColor || defaultTrackColor}
            thumbColor={props.thumbColor || defaultThumbColor}
            ios_backgroundColor={isDark ? '#374151' : '#D1D5DB'}
        />
    );
} 