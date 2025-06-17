import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useRef, useState } from 'react';
import {
    Animated,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface ClipboardInputProps {
    value: string;
    label?: string;
    editable?: boolean;
    placeholder?: string;
    onChangeText?: (text: string) => void;
    error?: string;
    touched?: boolean;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    showCopyButton?: boolean;
    selectAllOnPress?: boolean;
    onCopySuccess?: () => void;
    onCopyError?: (error: Error) => void;
}

export const ClipboardInput: React.FC<ClipboardInputProps> = ({
    value,
    label,
    editable = true,
    placeholder,
    onChangeText,
    error,
    touched,
    style,
    inputStyle,
    showCopyButton = true,
    selectAllOnPress = true,
    onCopySuccess,
    onCopyError,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isCopied, setIsCopied] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const textInputRef = useRef<TextInput>(null);

    // Animation values
    const iconScale = useRef(new Animated.Value(1)).current;
    const iconRotation = useRef(new Animated.Value(0)).current;
    const iconOpacity = useRef(new Animated.Value(1)).current;

    const handleCopy = async () => {
        if (isAnimating || !value) return;

        setIsAnimating(true);

        try {
            await Clipboard.setStringAsync(value);
            setIsCopied(true);
            onCopySuccess?.();

            // Animate icon change
            Animated.sequence([
                // Scale down and fade out current icon
                Animated.parallel([
                    Animated.timing(iconScale, {
                        toValue: 0.8,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(iconOpacity, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]),
                // Scale up and fade in new icon
                Animated.parallel([
                    Animated.timing(iconScale, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(iconOpacity, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();

            // Reset after 2 seconds
            setTimeout(() => {
                setIsCopied(false);

                // Animate back to copy icon
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(iconScale, {
                            toValue: 0.8,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                        Animated.timing(iconOpacity, {
                            toValue: 0,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(iconScale, {
                            toValue: 1,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                        Animated.timing(iconOpacity, {
                            toValue: 1,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                    ]),
                ]).start(() => {
                    setIsAnimating(false);
                });
            }, 2000);

        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            onCopyError?.(error as Error);
            setIsAnimating(false);
        }
    };

    const handlePress = () => {
        if (!editable && selectAllOnPress && textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.setSelection(0, value.length);
        }
    };

    const hasError = touched && error;

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[
                    styles.label,
                    isDark && styles.labelDark,
                    hasError && styles.labelError,
                    hasError && isDark && styles.labelErrorDark,
                ]}>
                    {label}
                </Text>
            )}

            <View style={[
                styles.inputContainer,
                isDark && styles.inputContainerDark,
                !editable && styles.inputContainerReadonly,
                !editable && isDark && styles.inputContainerReadonlyDark,
                hasError && styles.inputContainerError,
                hasError && isDark && styles.inputContainerErrorDark,
            ]}>
                {editable ? (
                    <TextInput
                        ref={textInputRef}
                        style={[
                            styles.input,
                            isDark && styles.inputDark,
                            inputStyle,
                        ]}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        editable={editable}
                        selectTextOnFocus={selectAllOnPress}
                    />
                ) : (
                    <TouchableOpacity
                        style={styles.readonlyContainer}
                        onPress={handlePress}
                        activeOpacity={0.7}
                    >
                        <TextInput
                            ref={textInputRef}
                            style={[
                                styles.input,
                                styles.readonlyInput,
                                isDark && styles.inputDark,
                                inputStyle,
                            ]}
                            value={value}
                            placeholder={placeholder}
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            editable={false}
                            selectTextOnFocus={selectAllOnPress}
                        />
                    </TouchableOpacity>
                )}

                {showCopyButton && value && (
                    <TouchableOpacity
                        style={[
                            styles.copyButton,
                            isDark && styles.copyButtonDark,
                        ]}
                        onPress={handleCopy}
                        disabled={isAnimating}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            style={[
                                styles.iconContainer,
                                {
                                    transform: [{ scale: iconScale }],
                                    opacity: iconOpacity,
                                },
                            ]}
                        >
                            <Ionicons
                                name={isCopied ? 'checkmark' : 'copy-outline'}
                                size={18}
                                color={
                                    isCopied
                                        ? (isDark ? '#34D399' : '#10B981')
                                        : (isDark ? '#9CA3AF' : '#6B7280')
                                }
                            />
                        </Animated.View>
                    </TouchableOpacity>
                )}
            </View>

            {hasError && (
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle"
                        size={16}
                        color={isDark ? '#F87171' : '#EF4444'}
                        style={styles.errorIcon}
                    />
                    <Text style={[
                        styles.errorText,
                        isDark && styles.errorTextDark,
                    ]}>
                        {error}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    labelDark: {
        color: '#D1D5DB',
    },
    labelError: {
        color: '#EF4444',
    },
    labelErrorDark: {
        color: '#F87171',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        paddingRight: 12,
        minHeight: 48,
    },
    inputContainerDark: {
        borderColor: '#374151',
        backgroundColor: '#1F2937',
    },
    inputContainerReadonly: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
    },
    inputContainerReadonlyDark: {
        backgroundColor: '#111827',
        borderColor: '#4B5563',
    },
    inputContainerError: {
        borderColor: '#EF4444',
    },
    inputContainerErrorDark: {
        borderColor: '#F87171',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingHorizontal: 12,
        paddingVertical: 12,
        minHeight: 48,
    },
    inputDark: {
        color: '#F9FAFB',
    },
    readonlyContainer: {
        flex: 1,
    },
    readonlyInput: {
        backgroundColor: 'transparent',
    },
    copyButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    copyButtonDark: {
        backgroundColor: 'transparent',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 20,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    errorIcon: {
        marginRight: 6,
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        flex: 1,
    },
    errorTextDark: {
        color: '#F87171',
    },
});

export default ClipboardInput; 