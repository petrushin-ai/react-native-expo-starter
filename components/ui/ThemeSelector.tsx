import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Switch } from '@/components/ui/Switch';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemeSelectorProps {
    compact?: boolean;
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
    const { themeMode, setThemeMode, colorScheme } = useTheme();

    // Theme colors
    const backgroundColor = useThemeColor({}, 'settingsCard');
    const borderColor = useThemeColor({}, 'settingsBorder');
    const textColor = useThemeColor({}, 'text');
    const mutedTextColor = useThemeColor({}, 'muted');
    const iconColor = useThemeColor({}, 'icon');

    const themeOptions: Array<{ mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }> = [
        {
            mode: 'system',
            label: 'System',
            icon: 'phone-portrait-outline',
            description: 'Use device settings'
        },
        {
            mode: 'light',
            label: 'Light',
            icon: 'sunny-outline',
            description: 'Light appearance'
        },
        {
            mode: 'dark',
            label: 'Dark',
            icon: 'moon-outline',
            description: 'Dark appearance'
        }
    ];

    const handleThemeChange = async (mode: ThemeMode) => {
        await setThemeMode(mode);
    };

    if (compact) {
        return (
            <View style={[styles.compactContainer, { backgroundColor, borderColor }]}>
                <View style={styles.compactHeader}>
                    <Ionicons name="color-palette-outline" size={20} color={iconColor} />
                    <Text style={[styles.compactTitle, { color: textColor }]}>Theme</Text>
                    <Text style={[styles.compactDescription, { color: mutedTextColor }]}>
                        {colorScheme === 'dark' ? 'Dark' : 'Light'} • {themeMode === 'system' ? 'Auto' : themeMode}
                    </Text>
                </View>
                <Switch
                    value={colorScheme === 'dark'}
                    onValueChange={(isDark) => setThemeMode(isDark ? 'dark' : 'light')}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor, borderColor }]}>
            <View style={styles.header}>
                <Ionicons name="color-palette-outline" size={24} color={iconColor} />
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: textColor }]}>Appearance</Text>
                    <Text style={[styles.subtitle, { color: mutedTextColor }]}>
                        Choose your preferred theme
                    </Text>
                </View>
            </View>

            <View style={styles.optionsContainer}>
                {themeOptions.map((option) => (
                    <TouchableOpacity
                        key={option.mode}
                        style={[
                            styles.option,
                            {
                                backgroundColor: themeMode === option.mode ? useThemeColor({}, 'surface') : 'transparent',
                                borderColor: themeMode === option.mode ? useThemeColor({}, 'tint') : borderColor,
                            }
                        ]}
                        onPress={() => handleThemeChange(option.mode)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: themeMode === option.mode }}
                        accessibilityLabel={`${option.label} theme. ${option.description}`}
                    >
                        <View style={styles.optionContent}>
                            <Ionicons
                                name={option.icon}
                                size={24}
                                color={themeMode === option.mode ? useThemeColor({}, 'tint') : iconColor}
                            />
                            <View style={styles.optionText}>
                                <Text style={[
                                    styles.optionLabel,
                                    { color: themeMode === option.mode ? useThemeColor({}, 'tint') : textColor }
                                ]}>
                                    {option.label}
                                </Text>
                                <Text style={[styles.optionDescription, { color: mutedTextColor }]}>
                                    {option.description}
                                </Text>
                            </View>
                        </View>
                        {themeMode === option.mode && (
                            <Ionicons name="checkmark-circle" size={20} color={useThemeColor({}, 'tint')} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {themeMode === 'system' && (
                <View style={styles.systemInfo}>
                    <Text style={[styles.systemInfoText, { color: mutedTextColor }]}>
                        Currently using {colorScheme} mode based on your device settings
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginVertical: 8,
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginVertical: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    compactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    compactTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    compactDescription: {
        fontSize: 14,
        marginLeft: 'auto',
        marginRight: 12,
    },
    optionsContainer: {
        gap: 8,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionText: {
        marginLeft: 12,
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    optionDescription: {
        fontSize: 14,
        marginTop: 2,
    },
    systemInfo: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    systemInfoText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
}); 