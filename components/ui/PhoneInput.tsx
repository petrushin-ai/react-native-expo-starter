import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { forwardRef, useEffect, useState } from 'react';
import {
    Dimensions,
    Keyboard,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import PhoneInputLib, {
    ICountry,
    IPhoneInputRef,
    isValidPhoneNumber,
} from 'react-native-international-phone-number';

export interface PhoneInputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChangePhoneNumber?: (phoneNumber: string) => void;
    selectedCountry?: ICountry | null;
    onChangeSelectedCountry?: (country: ICountry) => void;
    error?: string;
    touched?: boolean;
    containerStyle?: ViewStyle;
    disabled?: boolean;
    defaultCountry?: string;
    defaultValue?: string;
    language?: string;
    showOnly?: string[];
    excludedCountries?: string[];
    popularCountries?: string[];
    testID?: string;
}

export const PhoneInput = forwardRef<IPhoneInputRef, PhoneInputProps>(
    ({
        label,
        placeholder = "Enter phone number",
        value,
        onChangePhoneNumber = () => { },
        selectedCountry,
        onChangeSelectedCountry = () => { },
        error,
        touched,
        containerStyle,
        disabled = false,
        defaultCountry = "US",
        defaultValue,
        language = "en",
        showOnly,
        excludedCountries,
        popularCountries,
        testID,
        ...props
    }, ref) => {
        const colorScheme = useColorScheme();
        const isDark = colorScheme === 'dark';
        const showError = touched && error;

        // Keyboard height tracking
        const [keyboardHeight, setKeyboardHeight] = useState(0);

        useEffect(() => {
            const keyboardWillShowListener = Keyboard.addListener(
                Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
                (event: any) => {
                    setKeyboardHeight(event.endCoordinates.height);
                }
            );

            const keyboardWillHideListener = Keyboard.addListener(
                Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
                () => {
                    setKeyboardHeight(0);
                }
            );

            return () => {
                keyboardWillShowListener.remove();
                keyboardWillHideListener.remove();
            };
        }, []);

        // Theme-aware styling for the phone input library
        const phoneInputStyles = {
            container: [
                styles.phoneContainer,
                isDark && styles.phoneContainerDark,
                showError && styles.phoneContainerError,
                showError && isDark && styles.phoneContainerErrorDark,
                disabled && styles.phoneContainerDisabled,
            ].reduce((acc, style) => ({ ...acc, ...style }), {}),
            flagContainer: {
                backgroundColor: 'transparent',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                paddingHorizontal: 12,
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
                borderRightWidth: 1,
                borderRightColor: isDark ? '#374151' : '#E5E7EB',
            },
            flag: {
                fontSize: 20,
            },
            caret: {
                color: isDark ? '#9CA3AF' : '#6B7280',
                fontSize: 16,
                marginLeft: 4,
            },
            divider: {
                backgroundColor: isDark ? '#374151' : '#E5E7EB',
                width: 1,
                height: 24,
            },
            callingCode: {
                fontSize: 16,
                color: isDark ? '#F9FAFB' : '#111827',
                fontWeight: '500' as const,
                paddingHorizontal: 8,
            },
            input: {
                flex: 1,
                fontSize: 16,
                color: isDark ? '#F9FAFB' : '#111827',
                paddingHorizontal: 12,
                paddingVertical: 0,
                letterSpacing: -0.2,
            },
        } as any;

        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

        // Calculate available height considering status bar and keyboard
        const statusBarHeight = Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight || 0);
        const safeAreaPadding = Platform.OS === 'ios' ? 40 : 20; // iOS needs more padding for safe area
        const availableHeight = screenHeight - statusBarHeight - keyboardHeight;

        // Modal dimensions - responsive to keyboard state
        const modalWidth = screenWidth * 0.9; // 90% of screen width
        const dynamicHeight = keyboardHeight > 0 ?
            Math.min(320, availableHeight - 60) : // When keyboard is visible: smaller and leave more space
            Math.min(440, availableHeight * 0.6); // When keyboard is hidden: reasonable size with better bounds
        const modalHeight = Math.max(280, dynamicHeight); // Minimum 280px height

        const modalStyles = {
            modal: {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderRadius: 12,
                width: modalWidth,
                height: modalHeight,
                maxHeight: modalHeight,
                alignSelf: 'center' as const,
                marginTop: keyboardHeight > 0
                    ? Math.max(safeAreaPadding, statusBarHeight + 15) // When keyboard visible: position near top
                    : Math.max(safeAreaPadding + 10, (availableHeight - modalHeight) / 2 + statusBarHeight), // When keyboard hidden: center with padding
                marginBottom: keyboardHeight > 0 ? 15 : Math.max(30, (availableHeight - modalHeight) / 2),
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 8,
            },
            backdrop: {
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
            },
            divider: {
                backgroundColor: 'transparent',
            },
            countriesList: {
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
                paddingTop: 6, // Reduced top padding
                paddingBottom: 16, // Reduced bottom padding
                maxHeight: modalHeight - 120,
                flex: 1,
            },
            searchInput: {
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? '#4B5563' : '#E5E7EB',
                color: isDark ? '#F9FAFB' : '#111827',
                fontSize: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginHorizontal: 12,
                marginTop: 16,
                marginBottom: 16,
                width: modalWidth - 28, // Fixed width to match country buttons perfectly
                alignSelf: 'center' as const, // Center the search input
            },
            countryButton: {
                backgroundColor: isDark ? '#374151' : '#F9FAFB', // Secondary background color
                borderRadius: 6,
                marginHorizontal: 12,
                marginBottom: 6,
                paddingHorizontal: 12,
                paddingVertical: 10,
                flexDirection: 'row' as const,
                alignItems: 'center' as const,
                justifyContent: 'space-between' as const,
                minHeight: 44,
                borderWidth: 1,
                borderColor: isDark ? '#4B5563' : '#E5E7EB',
                width: modalWidth - 42, // Adjusted to match search input width (accounts for different padding)
                alignSelf: 'center' as const, // Center the button within the container
            },
            noCountryText: {
                color: isDark ? '#9CA3AF' : '#6B7280',
                fontSize: 16,
                textAlign: 'center' as const,
                padding: 20,
                fontStyle: 'italic' as const,
            },
            noCountryContainer: {
                backgroundColor: 'transparent',
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
                paddingVertical: 40,
            },
            flag: {
                fontSize: 18, // Slightly smaller flag
                marginRight: 10, // Reduced margin
                width: 22, // Reduced width
                textAlign: 'center' as const,
            },
            callingCode: {
                color: isDark ? '#9CA3AF' : '#6B7280',
                fontSize: 13, // Slightly smaller text
                fontWeight: '500' as const,
                minWidth: 55, // Reduced width
                textAlign: 'left' as const,
                marginRight: 10, // Reduced margin
            },
            countryName: {
                color: isDark ? '#F9FAFB' : '#111827',
                fontSize: 15, // Slightly smaller text
                flex: 1,
                fontWeight: '400' as const,
            },
            sectionTitle: {
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                color: isDark ? '#D1D5DB' : '#374151',
                fontSize: 14,
                fontWeight: '600' as const,
                paddingHorizontal: 20,
                paddingVertical: 12,
                marginTop: 8,
                borderTopWidth: 1,
                borderTopColor: isDark ? '#4B5563' : '#E5E7EB',
                textTransform: 'uppercase' as const,
                letterSpacing: 0.5,
            },
        } as any;

        return (
            <View style={[styles.container, containerStyle]}>
                {label && (
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        {label}
                    </Text>
                )}
                {/* @ts-ignore - Library type definitions are inconsistent but functionality works */}
                <PhoneInputLib
                    ref={ref}
                    value={value || ''}
                    onChangePhoneNumber={onChangePhoneNumber}
                    selectedCountry={selectedCountry}
                    onChangeSelectedCountry={onChangeSelectedCountry}
                    placeholder={placeholder}
                    disabled={disabled}
                    defaultCountry={defaultCountry as any}
                    defaultValue={defaultValue}
                    language={language as any}
                    theme={isDark ? 'dark' : 'light'}
                    phoneInputStyles={phoneInputStyles}
                    modalStyles={modalStyles}
                    showOnly={showOnly as any}
                    excludedCountries={excludedCountries as any}
                    popularCountries={popularCountries as any}
                    modalSearchInputPlaceholder="Search countries..."
                    modalNotFoundCountryMessage="No country found"
                    customCaret={
                        <Ionicons
                            name="chevron-down"
                            size={16}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                    }
                    testID={testID}
                    modalHeight="85%"
                    allowZeroAfterCallingCode={false}
                    modalPresentationStyle="overFullScreen"
                    modalAnimationType="fade"
                    touchableOpacityProps={{
                        activeOpacity: 0.7,
                        delayPressIn: 0,
                        delayPressOut: 0,
                    }}
                    {...props}
                />
                <View style={styles.errorContainer}>
                    {showError && (
                        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                            {error}
                        </Text>
                    )}
                </View>
            </View>
        );
    }
);

PhoneInput.displayName = 'PhoneInput';

// Export validation function and types for convenience
export { isValidPhoneNumber };
export type { ICountry, IPhoneInputRef };

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
        letterSpacing: -0.1,
    },
    labelDark: {
        color: '#D1D5DB',
    },
    phoneContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneContainerDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    phoneContainerError: {
        borderColor: '#DC2626',
        shadowColor: '#DC2626',
        shadowOpacity: 0.1,
    },
    phoneContainerErrorDark: {
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    phoneContainerDisabled: {
        backgroundColor: '#F9FAFB',
        opacity: 0.6,
    },
    errorContainer: {
        height: 20,
        justifyContent: 'center',
        paddingHorizontal: 4,
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
        letterSpacing: -0.1,
    },
    errorTextDark: {
        color: '#F87171',
    },
}); 