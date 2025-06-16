import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export function DarkModePreview() {
    const { colorScheme, themeMode } = useTheme();

    // Theme colors
    const backgroundColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const mutedTextColor = useThemeColor({}, 'muted');
    const iconColor = useThemeColor({}, 'icon');
    const surfaceColor = useThemeColor({}, 'surface');

    return (
        <View style={[styles.container, { backgroundColor, borderColor }]}>
            <View style={styles.header}>
                <Ionicons name="contrast-outline" size={24} color={iconColor} />
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: textColor }]}>Dark Mode Preview</Text>
                    <Text style={[styles.subtitle, { color: mutedTextColor }]}>
                        See how your app looks in different themes
                    </Text>
                </View>
            </View>

            {/* Current Theme Status */}
            <View style={[styles.statusCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.statusRow}>
                    <View style={styles.statusItem}>
                        <Text style={[styles.statusLabel, { color: mutedTextColor }]}>Current Theme</Text>
                        <Text style={[styles.statusValue, { color: textColor }]}>
                            {colorScheme === 'dark' ? 'Dark' : 'Light'}
                        </Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={[styles.statusLabel, { color: mutedTextColor }]}>Theme Mode</Text>
                        <Text style={[styles.statusValue, { color: textColor }]}>
                            {themeMode === 'system' ? 'Auto' : themeMode}
                        </Text>
                    </View>
                </View>

                <View style={styles.colorPreview}>
                    <Text style={[styles.colorPreviewTitle, { color: textColor }]}>Color Preview</Text>
                    <View style={styles.colorSamples}>
                        <View style={styles.colorSample}>
                            <View style={[styles.colorDot, { backgroundColor: useThemeColor({}, 'background') }]} />
                            <Text style={[styles.colorLabel, { color: mutedTextColor }]}>Background</Text>
                        </View>
                        <View style={styles.colorSample}>
                            <View style={[styles.colorDot, { backgroundColor: useThemeColor({}, 'text') }]} />
                            <Text style={[styles.colorLabel, { color: mutedTextColor }]}>Text</Text>
                        </View>
                        <View style={styles.colorSample}>
                            <View style={[styles.colorDot, { backgroundColor: useThemeColor({}, 'tint') }]} />
                            <Text style={[styles.colorLabel, { color: mutedTextColor }]}>Accent</Text>
                        </View>
                        <View style={styles.colorSample}>
                            <View style={[styles.colorDot, { backgroundColor: useThemeColor({}, 'surface') }]} />
                            <Text style={[styles.colorLabel, { color: mutedTextColor }]}>Surface</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Compact Theme Selector for Demo */}
            <View style={styles.selectorContainer}>
                <Text style={[styles.selectorTitle, { color: textColor }]}>Quick Theme Switch</Text>
                <ThemeSelector compact />
            </View>

            {/* Theme Information */}
            <View style={[styles.infoContainer, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="information-circle-outline" size={20} color={iconColor} />
                <Text style={[styles.infoText, { color: mutedTextColor }]}>
                    This preview updates in real-time as you change themes. The theme preference is automatically saved and will persist across app restarts.
                </Text>
            </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    statusCard: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    statusItem: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statusValue: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    colorPreview: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        paddingTop: 16,
    },
    colorPreviewTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    colorSamples: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    colorSample: {
        alignItems: 'center',
        flex: 1,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        marginBottom: 8,
    },
    colorLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    selectorContainer: {
        marginBottom: 16,
    },
    selectorTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    infoText: {
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
}); 