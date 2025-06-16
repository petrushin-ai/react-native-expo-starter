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

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: 'error' | 'success' | 'info' | 'warning';
    primaryButtonText?: string;
    onPrimaryPress?: () => void;
    secondaryButtonText?: string;
    onSecondaryPress?: () => void;
    showCloseButton?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function Modal({
    visible,
    onClose,
    title,
    message,
    type = 'info',
    primaryButtonText = 'OK',
    onPrimaryPress,
    secondaryButtonText,
    onSecondaryPress,
    showCloseButton = true,
}: ModalProps) {
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

    const handlePrimaryPress = () => {
        if (onPrimaryPress) {
            onPrimaryPress();
        } else {
            onClose();
        }
    };

    const handleSecondaryPress = () => {
        if (onSecondaryPress) {
            onSecondaryPress();
        } else {
            onClose();
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return {
                    accentColor: '#DC2626',
                    darkAccentColor: '#EF4444',
                    borderColor: '#FEE2E2',
                    darkBorderColor: '#7F1D1D',
                };
            case 'success':
                return {
                    accentColor: '#059669',
                    darkAccentColor: '#10B981',
                    borderColor: '#D1FAE5',
                    darkBorderColor: '#064E3B',
                };
            case 'warning':
                return {
                    accentColor: '#D97706',
                    darkAccentColor: '#F59E0B',
                    borderColor: '#FEF3C7',
                    darkBorderColor: '#78350F',
                };
            default: // info
                return {
                    accentColor: '#2563EB',
                    darkAccentColor: '#3B82F6',
                    borderColor: '#DBEAFE',
                    darkBorderColor: '#1E3A8A',
                };
        }
    };

    const typeStyles = getTypeStyles();

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
                                { backgroundColor: isDark ? typeStyles.darkAccentColor : typeStyles.accentColor }
                            ]} />

                            {title && (
                                <Text style={[styles.title, isDark && styles.titleDark]}>
                                    {title}
                                </Text>
                            )}

                            <Text style={[styles.message, isDark && styles.messageDark]}>
                                {message}
                            </Text>

                            <View style={styles.buttonContainer}>
                                {secondaryButtonText && (
                                    <TouchableOpacity
                                        style={[styles.secondaryButton, isDark && styles.secondaryButtonDark]}
                                        onPress={handleSecondaryPress}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
                                            {secondaryButtonText}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.primaryButton,
                                        { backgroundColor: isDark ? typeStyles.darkAccentColor : typeStyles.accentColor },
                                        secondaryButtonText && styles.primaryButtonWithSecondary,
                                    ]}
                                    onPress={handlePrimaryPress}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
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
        borderRadius: 8,
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
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginTop: 24,
        marginHorizontal: 24,
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    message: {
        fontSize: 15,
        color: '#4B5563',
        marginHorizontal: 24,
        marginBottom: 24,
        lineHeight: 22,
        letterSpacing: -0.2,
    },
    messageDark: {
        color: '#D1D5DB',
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
    },
    primaryButtonWithSecondary: {
        flex: 1,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
}); 