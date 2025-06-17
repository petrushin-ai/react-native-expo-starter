import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { forwardRef, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { MultiSelect, Dropdown as RNEDropdown } from 'react-native-element-dropdown';

export interface DropdownItem {
    label: string;
    value: string;
    [key: string]: any;
}

export interface BaseDropdownProps {
    label?: string;
    error?: string;
    touched?: boolean;
    containerStyle?: ViewStyle;
    placeholder?: string;
    searchPlaceholder?: string;
    data: DropdownItem[];
    search?: boolean;
    disable?: boolean;
    maxHeight?: number;
    labelField?: string;
    valueField?: string;
}

export interface SingleDropdownProps extends BaseDropdownProps {
    mode?: 'single';
    value?: string;
    onChange: (item: DropdownItem) => void;
}

export interface MultiDropdownProps extends BaseDropdownProps {
    mode: 'multi';
    value?: string[];
    onChange: (items: string[]) => void;
    selectedStyle?: ViewStyle;
}

export type DropdownProps = SingleDropdownProps | MultiDropdownProps;

export const Dropdown = forwardRef<any, DropdownProps>(
    ({
        label,
        error,
        touched,
        containerStyle,
        placeholder = 'Select item',
        searchPlaceholder = 'Search...',
        data,
        search = false,
        disable = false,
        maxHeight = 250,
        labelField = 'label',
        valueField = 'value',
        mode = 'single',
        value,
        onChange,
        ...props
    }, ref) => {
        const colorScheme = useColorScheme();
        const isDark = colorScheme === 'dark';
        const showError = touched && error;
        const multiSelectRef = useRef<any>(null);

        const getDropdownStyles = () => ({
            dropdown: [
                styles.dropdown,
                isDark && styles.dropdownDark,
                showError && styles.dropdownError,
                showError && isDark && styles.dropdownErrorDark,
            ],
            placeholderStyle: [
                styles.placeholderStyle,
                isDark && styles.placeholderStyleDark,
            ],
            selectedTextStyle: [
                styles.selectedTextStyle,
                isDark && styles.selectedTextStyleDark,
            ],
            inputSearchStyle: [
                styles.inputSearchStyle,
                isDark && styles.inputSearchStyleDark,
            ],
            iconStyle: styles.iconStyle,
            containerStyle: [
                styles.listContainer,
                isDark && styles.listContainerDark,
            ],
            itemContainerStyle: [
                styles.itemContainer,
                isDark && styles.itemContainerDark,
            ],
            itemTextStyle: [
                styles.itemText,
                isDark && styles.itemTextDark,
            ],
            activeColor: isDark ? '#374151' : '#F3F4F6',
        });

        const dropdownStyles = getDropdownStyles();

        const renderRightIcon = (visible?: boolean) => (
            <Ionicons
                name={visible ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={isDark ? '#9CA3AF' : '#6B7280'}
            />
        );

        const renderLeftIcon = () => (
            <Ionicons
                name="list-outline"
                size={18}
                color={isDark ? '#9CA3AF' : '#6B7280'}
                style={styles.leftIcon}
            />
        );

        // Custom handler for multi-select that closes dropdown after selection
        const handleMultiSelectChange = (items: string[]) => {
            onChange(items as any);
            // Close the dropdown after selection
            if (multiSelectRef.current) {
                multiSelectRef.current.close();
            }
        };

        const commonProps = {
            style: dropdownStyles.dropdown,
            placeholderStyle: dropdownStyles.placeholderStyle,
            selectedTextStyle: dropdownStyles.selectedTextStyle,
            inputSearchStyle: dropdownStyles.inputSearchStyle,
            iconStyle: dropdownStyles.iconStyle,
            containerStyle: dropdownStyles.containerStyle,
            itemContainerStyle: dropdownStyles.itemContainerStyle,
            itemTextStyle: dropdownStyles.itemTextStyle,
            activeColor: dropdownStyles.activeColor,
            data,
            maxHeight,
            labelField,
            valueField,
            placeholder,
            searchPlaceholder,
            search,
            disable,
            renderRightIcon,
            renderLeftIcon,
            dropdownPosition: 'auto' as const,
            showsVerticalScrollIndicator: true,
        };

        return (
            <View style={[styles.container, containerStyle]}>
                {label && (
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        {label}
                    </Text>
                )}

                {mode === 'multi' ? (
                    <MultiSelect
                        ref={multiSelectRef}
                        {...commonProps}
                        {...(props as any)}
                        value={value as string[]}
                        onChange={handleMultiSelectChange}
                        selectedStyle={[
                            styles.selectedChip,
                            isDark && styles.selectedChipDark,
                            (props as MultiDropdownProps).selectedStyle,
                        ]}
                        renderSelectedItem={(item, unSelect) => (
                            <View style={styles.selectedItemWrapper}>
                                <TouchableOpacity
                                    onPress={() => unSelect && unSelect(item)}
                                    style={[styles.selectedChip, isDark && styles.selectedChipDark]}
                                >
                                    <Text style={[styles.selectedChipText, isDark && styles.selectedChipTextDark]}>
                                        {item[labelField]}
                                    </Text>
                                    <Ionicons
                                        name="close"
                                        size={14}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                ) : (
                    <RNEDropdown
                        ref={ref}
                        {...commonProps}
                        {...(props as any)}
                        value={value as string}
                        onChange={onChange as (item: DropdownItem) => void}
                    />
                )}

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

Dropdown.displayName = 'Dropdown';

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
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        minHeight: 44,
    },
    dropdownDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    dropdownError: {
        borderColor: '#DC2626',
        shadowColor: '#DC2626',
        shadowOpacity: 0.1,
    },
    dropdownErrorDark: {
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#6B7280',
        letterSpacing: -0.2,
    },
    placeholderStyleDark: {
        color: '#9CA3AF',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#111827',
        letterSpacing: -0.2,
    },
    selectedTextStyleDark: {
        color: '#F9FAFB',
    },
    inputSearchStyle: {
        height: 36,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        paddingHorizontal: 10,
        letterSpacing: -0.2,
    },
    inputSearchStyleDark: {
        color: '#F9FAFB',
        backgroundColor: '#374151',
    },
    iconStyle: {
        width: 18,
        height: 18,
    },
    leftIcon: {
        marginRight: 6,
    },
    listContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    listContainerDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    itemContainer: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemContainerDark: {
        borderBottomColor: '#374151',
    },
    itemText: {
        fontSize: 16,
        color: '#111827',
        letterSpacing: -0.2,
    },
    itemTextDark: {
        color: '#F9FAFB',
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignSelf: 'flex-start',
    },
    selectedChipDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    selectedChipText: {
        fontSize: 16,
        color: '#374151',
        marginRight: 4,
        letterSpacing: -0.1,
    },
    selectedChipTextDark: {
        color: '#D1D5DB',
    },
    selectedItemWrapper: {
        marginTop: 12,
        marginRight: 0,
        marginBottom: 0,
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