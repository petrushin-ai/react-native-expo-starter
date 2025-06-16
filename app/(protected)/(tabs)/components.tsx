import { Button } from '@/components/ui/Button';
import ExpandableView from '@/components/ui/ExpandableView';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ComponentsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [modalVisible, setModalVisible] = useState(false);
    const [expandableVisible, setExpandableVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [switchValue, setSwitchValue] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);

    // Demo form for input showcase
    const demoForm = useFormValidation({
        username: {
            initialValue: '',
            rules: [
                validationRules.required('Username is required'),
                validationRules.minLength(3, 'Minimum 3 characters'),
            ],
        },
        email: {
            initialValue: '',
            rules: [
                validationRules.required('Email is required'),
                validationRules.email('Invalid email format'),
            ],
        },
        password: {
            initialValue: '',
            rules: [
                validationRules.required('Password is required'),
                validationRules.minLength(6, 'Minimum 6 characters'),
            ],
        },
    });

    const handleLoadingDemo = async () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={isDark ? '#111827' : '#F9FAFB'}
            />
            <ScrollView style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.content}>
                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        UI Components
                    </Text>
                    <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                        Showcase of all available UI components in the design system
                    </Text>

                    {/* Button Components */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Buttons
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Interactive buttons with multiple variants, sizes, and states including loading and disabled states.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Variants
                            </Text>
                            <View style={styles.buttonRow}>
                                <Button title="Primary" variant="primary" />
                                <Button title="Secondary" variant="secondary" />
                            </View>
                            <View style={styles.buttonRow}>
                                <Button title="Outline" variant="outline" />
                                <Button title="Ghost" variant="ghost" />
                            </View>
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Sizes
                            </Text>
                            <View style={styles.buttonColumn}>
                                <Button title="Small Button" size="small" />
                                <Button title="Medium Button" size="medium" />
                                <Button title="Large Button" size="large" />
                            </View>
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                States
                            </Text>
                            <View style={styles.buttonRow}>
                                <Button
                                    title={loading ? "Loading..." : "Load Demo"}
                                    loading={loading}
                                    onPress={handleLoadingDemo}
                                />
                                <Button title="Disabled" disabled />
                            </View>
                        </View>
                    </View>

                    {/* Input Components */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Input Fields
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Form input components with validation, error states, and different variants.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Input
                                {...demoForm.getFieldProps('username')}
                                label="Username"
                                placeholder="Enter your username"
                                error={demoForm.getFieldError('username')}
                                touched={demoForm.formState.username?.touched || false}
                            />
                            <Input
                                {...demoForm.getFieldProps('email')}
                                label="Email"
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                error={demoForm.getFieldError('email')}
                                touched={demoForm.formState.email?.touched || false}
                            />

                            {/* Password Input with Toggle */}
                            <View style={styles.passwordContainer}>
                                <Input
                                    {...demoForm.getFieldProps('password')}
                                    label="Password"
                                    placeholder="Enter your password"
                                    secureTextEntry={!passwordVisible}
                                    error={demoForm.getFieldError('password')}
                                    touched={demoForm.formState.password?.touched || false}
                                    style={{ paddingRight: 50 }}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                >
                                    <Ionicons
                                        name={passwordVisible ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Input
                                label="Filled Variant"
                                placeholder="Filled input style"
                                variant="filled"
                            />
                        </View>
                    </View>

                    {/* Modal Component */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Modal
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Overlay dialogs for displaying content, confirmations, or forms above the main interface.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Button
                                title="Show Modal"
                                onPress={() => setModalVisible(true)}
                                variant="outline"
                            />
                        </View>
                    </View>

                    {/* ExpandableView Component */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Expandable View
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Smoothly animated container that expands and collapses content with height transitions.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Button
                                title={expandableVisible ? "Hide Content" : "Show Content"}
                                onPress={() => setExpandableVisible(!expandableVisible)}
                                variant="secondary"
                            />
                            <ExpandableView expanded={expandableVisible}>
                                <View style={[styles.expandableContent, isDark && styles.expandableContentDark]}>
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        This content smoothly animates in and out with height transitions.
                                        Perfect for FAQ sections, accordions, or any collapsible content.
                                    </Text>
                                </View>
                            </ExpandableView>
                        </View>
                    </View>

                    {/* Icons Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Icons
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Vector icons from Expo Vector Icons library with theme-aware colors.
                        </Text>

                        <View style={styles.componentGroup}>
                            <View style={styles.iconRow}>
                                <View style={styles.iconItem}>
                                    <Ionicons
                                        name="eye"
                                        size={24}
                                        color={isDark ? '#60A5FA' : '#3B82F6'}
                                    />
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>
                                        eye
                                    </Text>
                                </View>
                                <View style={styles.iconItem}>
                                    <Ionicons
                                        name="eye-off"
                                        size={24}
                                        color={isDark ? '#60A5FA' : '#3B82F6'}
                                    />
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>
                                        eye-off
                                    </Text>
                                </View>
                                <View style={styles.iconItem}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={24}
                                        color={isDark ? '#34D399' : '#10B981'}
                                    />
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>
                                        checkmark
                                    </Text>
                                </View>
                                <View style={styles.iconItem}>
                                    <Ionicons
                                        name="alert-circle"
                                        size={24}
                                        color={isDark ? '#F87171' : '#EF4444'}
                                    />
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>
                                        alert
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Switch Components */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Switch
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Toggle switches for binary settings with theme-aware styling and smooth animations.
                        </Text>

                        <View style={styles.componentGroup}>
                            <View style={styles.switchRow}>
                                <Text style={[styles.switchLabel, isDark && styles.switchLabelDark]}>
                                    Basic Switch
                                </Text>
                                <Switch
                                    value={switchValue}
                                    onValueChange={setSwitchValue}
                                />
                            </View>

                            <View style={styles.switchRow}>
                                <Text style={[styles.switchLabel, isDark && styles.switchLabelDark]}>
                                    Enable Notifications
                                </Text>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                />
                            </View>

                            <View style={styles.switchRow}>
                                <Text style={[styles.switchLabel, isDark && styles.switchLabelDark]}>
                                    Dark Mode Preview
                                </Text>
                                <Switch
                                    value={darkModeEnabled}
                                    onValueChange={setDarkModeEnabled}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Demo Modal"
                message="This is a demonstration of the modal component. It can display content, handle user actions, and supports both light and dark themes."
                type="info"
                primaryButtonText="Got it"
                secondaryButtonText="Cancel"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
        lineHeight: 24,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    sectionTitleDark: {
        color: '#F9FAFB',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        lineHeight: 20,
    },
    descriptionDark: {
        color: '#9CA3AF',
    },
    componentGroup: {
        marginBottom: 24,
    },
    variantTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 12,
    },
    variantTitleDark: {
        color: '#D1D5DB',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    buttonColumn: {
        gap: 12,
    },
    expandableContent: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
        marginTop: 12,
    },
    expandableContentDark: {
        backgroundColor: '#1F2937',
    },
    expandableText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    expandableTextDark: {
        color: '#D1D5DB',
    },
    iconRow: {
        flexDirection: 'row',
        gap: 24,
        flexWrap: 'wrap',
    },
    iconItem: {
        alignItems: 'center',
        gap: 8,
    },
    iconLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    iconLabelDark: {
        color: '#9CA3AF',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordToggle: {
        position: 'absolute',
        right: 12,
        top: '46%',
        transform: [{ translateY: -10 }],
    },
    toggleButton: {
        padding: 4,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        marginBottom: 8,
    },
    switchLabel: {
        fontSize: 14,
        color: '#374151',
    },
    switchLabelDark: {
        color: '#D1D5DB',
    },
}); 