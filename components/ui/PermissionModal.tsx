import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal as RNModal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface PermissionModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    permissionType: string;
    onOpenSettings: () => void;
    showCloseButton?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PermissionModal({
    visible,
    onClose,
    title,
    message,
    permissionType,
    onOpenSettings,
    showCloseButton = true,
}: PermissionModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 9,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleOpenSettings = () => {
        onOpenSettings();
        onClose();
    };

    const handleDismiss = () => {
        onClose();
    };

    return (
        <RNModal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="none"
        >
            <TouchableWithoutFeedback onPress={showCloseButton ? onClose : undefined}>
                <Animated.View
                    style={[
                        styles.overlay,
                        {
                            opacity: opacityValue,
                        },
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                isDark && styles.modalContainerDark,
                                {
                                    transform: [{ scale: scaleValue }],
                                },
                            ]}
                        >
                            <View style={[
                                styles.accentBar,
                                { backgroundColor: '#FF9500' } // Orange for settings/permissions
                            ]} />

                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>⚙️</Text>
                            </View>

                            <Text style={[styles.title, isDark && styles.titleDark]}>
                                {title}
                            </Text>

                            <Text style={[styles.message, isDark && styles.messageDark]}>
                                {message}
                            </Text>

                            <Text style={[styles.helpText, isDark && styles.helpTextDark]}>
                                To enable {permissionType}, please go to Settings and allow this permission.
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.secondaryButton, isDark && styles.secondaryButtonDark]}
                                    onPress={handleDismiss}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
                                        Maybe Later
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleOpenSettings}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.primaryButtonText}>Open Settings</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    modalContainerDark: {
        backgroundColor: '#1F2937',
    },
    accentBar: {
        height: 4,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 8,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginHorizontal: 24,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    message: {
        fontSize: 15,
        color: '#4B5563',
        marginHorizontal: 24,
        marginBottom: 12,
        lineHeight: 22,
        textAlign: 'center',
        letterSpacing: -0.2,
    },
    messageDark: {
        color: '#D1D5DB',
    },
    helpText: {
        fontSize: 13,
        color: '#6B7280',
        marginHorizontal: 24,
        marginBottom: 24,
        lineHeight: 18,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    helpTextDark: {
        color: '#9CA3AF',
    },
    buttonContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    secondaryButtonDark: {
        borderRightColor: '#374151',
    },
    secondaryButtonText: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    secondaryButtonTextDark: {
        color: '#9CA3AF',
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#FF9500',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
}); 