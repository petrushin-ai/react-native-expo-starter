import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import React from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from 'react-native'

interface CalendarLayoutProps {
    children: React.ReactNode
    styleContainer?: object
    styleContent?: object
}

export default function CalendarLayout({
    children,
    styleContainer = {},
    styleContent = {}
}: CalendarLayoutProps) {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, styleContainer]}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 16}
            >
                <View style={[styles.contentContainer, styleContent]}>{children}</View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
}) 