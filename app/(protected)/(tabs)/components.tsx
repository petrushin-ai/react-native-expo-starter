import { Button } from '@/components/ui/Button';
import { DarkModePreview } from '@/components/ui/DarkModePreview';
import { DatePicker } from '@/components/ui/DatePicker';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import ExpandableView from '@/components/ui/ExpandableView';
import { Input } from '@/components/ui/Input';
import { LottieAnimation, LottieView } from '@/components/ui/LottieAnimation';
import { Modal } from '@/components/ui/Modal';
import { PhoneInput, isValidPhoneNumber, type ICountry } from '@/components/ui/PhoneInput';
import { Switch } from '@/components/ui/Switch';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import React, { useRef, useState } from 'react';
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
    const [lottieAutoPlay, setLottieAutoPlay] = useState(true);
    const [lottieLoop, setLottieLoop] = useState(true);

    // Data fetching states
    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchDelay, setFetchDelay] = useState('2');
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [fetchExpandableVisible, setFetchExpandableVisible] = useState(false);

    // DatePicker states
    const [singleSelectedDate, setSingleSelectedDate] = useState<Date | null>(null);
    const [rangeStartDate, setRangeStartDate] = useState<Date | null>(null);
    const [rangeEndDate, setRangeEndDate] = useState<Date | null>(null);

    // Dropdown states
    const [singleDropdownValue, setSingleDropdownValue] = useState<string>('');
    const [multiDropdownValue, setMultiDropdownValue] = useState<string[]>([]);
    const [countryValue, setCountryValue] = useState<string>('');
    const [categoryValue, setCategoryValue] = useState<string>('');

    // Phone Input states
    const [phoneValue, setPhoneValue] = useState<string>('');
    const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<ICountry | null>(null);
    const [phoneValue2, setPhoneValue2] = useState<string>('');
    const [selectedPhoneCountry2, setSelectedPhoneCountry2] = useState<ICountry | null>(null);
    const [phoneValue3, setPhoneValue3] = useState<string>('');
    const [selectedPhoneCountry3, setSelectedPhoneCountry3] = useState<ICountry | null>(null);
    const [phoneValue4, setPhoneValue4] = useState<string>('');
    const [selectedPhoneCountry4, setSelectedPhoneCountry4] = useState<ICountry | null>(null);

    // Dropdown data
    const basicOptions: DropdownItem[] = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' },
        { label: 'Option 4', value: '4' },
        { label: 'Option 5', value: '5' },
    ];

    const categoryOptions: DropdownItem[] = [
        { label: 'Technology', value: 'tech' },
        { label: 'Design', value: 'design' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Business', value: 'business' },
        { label: 'Finance', value: 'finance' },
        { label: 'Education', value: 'education' },
        { label: 'Health', value: 'health' },
        { label: 'Entertainment', value: 'entertainment' },
    ];

    const countryOptions: DropdownItem[] = [
        { label: 'United States', value: 'us' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'Canada', value: 'ca' },
        { label: 'Australia', value: 'au' },
        { label: 'Germany', value: 'de' },
        { label: 'France', value: 'fr' },
        { label: 'Japan', value: 'jp' },
        { label: 'South Korea', value: 'kr' },
        { label: 'Brazil', value: 'br' },
        { label: 'India', value: 'in' },
    ];

    // Lottie animation refs for manual control
    const lottieRef1 = useRef<LottieView>(null);
    const lottieRef2 = useRef(null);

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

    const fetchData = async () => {
        if (fetchLoading) return;

        setFetchLoading(true);
        setFetchedData(null);
        setFetchExpandableVisible(false);

        try {
            // Apply custom delay
            const delayMs = Math.max(0, parseInt(fetchDelay) || 0) * 1000;
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            // Fetch data from JSONPlaceholder API
            const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setFetchedData(data);
            setFetchExpandableVisible(true);
        } catch (error) {
            console.error('Fetch error:', error);
            setFetchedData({
                error: true,
                message: error instanceof Error ? error.message : 'An unknown error occurred',
                timestamp: new Date().toISOString(),
            });
            setFetchExpandableVisible(true);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSingleDateChange = (date: Date) => {
        setSingleSelectedDate(date);
    };

    const handleRangeDateChange = (date: Date, type?: 'START_DATE' | 'END_DATE') => {
        if (type === 'END_DATE') {
            setRangeEndDate(date);
        } else {
            // Enhanced flexible range selection logic
            const dateTime = date.getTime();
            const startTime = rangeStartDate?.getTime();
            const endTime = rangeEndDate?.getTime();

            // Case 1: No dates selected yet - set as start date
            if (!rangeStartDate && !rangeEndDate) {
                setRangeStartDate(date);
                setRangeEndDate(null);
                return;
            }

            // Case 2: Only start date selected
            if (rangeStartDate && !rangeEndDate && startTime) {
                if (dateTime === startTime) {
                    // Clicking on the same start date - clear selection
                    setRangeStartDate(null);
                } else if (dateTime < startTime) {
                    // Clicking before start date - make it new start, old start becomes end
                    setRangeStartDate(date);
                    setRangeEndDate(rangeStartDate);
                } else {
                    // Clicking after start date - make it end date
                    setRangeEndDate(date);
                }
                return;
            }

            // Case 3: Both dates selected - most flexible scenarios
            if (rangeStartDate && rangeEndDate && startTime && endTime) {
                // Clicking on start date - move start date closer to end or swap if needed
                if (dateTime === startTime) {
                    // Move start date to one day after, or swap if that would be invalid
                    const nextDay = new Date(date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    if (nextDay.getTime() <= endTime) {
                        setRangeStartDate(nextDay);
                    } else {
                        // Swap: end becomes start, start becomes end
                        setRangeStartDate(rangeEndDate);
                        setRangeEndDate(date);
                    }
                }
                // Clicking on end date - move end date closer to start or swap if needed
                else if (dateTime === endTime) {
                    // Move end date to one day before, or swap if that would be invalid
                    const prevDay = new Date(date);
                    prevDay.setDate(prevDay.getDate() - 1);
                    if (prevDay.getTime() >= startTime) {
                        setRangeEndDate(prevDay);
                    } else {
                        // Swap: start becomes end, end becomes start
                        setRangeStartDate(date);
                        setRangeEndDate(rangeStartDate);
                    }
                }
                // Clicking on a date in the middle of range - split range or move closer end
                else if (dateTime > startTime && dateTime < endTime) {
                    // Find which end is closer and move that end to the clicked date
                    const distanceToStart = dateTime - startTime;
                    const distanceToEnd = endTime - dateTime;

                    if (distanceToStart <= distanceToEnd) {
                        // Closer to start - move start to clicked date
                        setRangeStartDate(date);
                    } else {
                        // Closer to end - move end to clicked date
                        setRangeEndDate(date);
                    }
                }
                // Clicking outside current range - determine new range intelligently
                else {
                    if (dateTime < startTime) {
                        // Before current range - extend start or create new range
                        const distanceToStart = startTime - dateTime;
                        const currentRangeSize = endTime - startTime;

                        if (distanceToStart <= currentRangeSize) {
                            // Close enough - extend the range
                            setRangeStartDate(date);
                        } else {
                            // Far away - start new range
                            setRangeStartDate(date);
                            setRangeEndDate(null);
                        }
                    } else {
                        // After current range - extend end or create new range
                        const distanceToEnd = dateTime - endTime;
                        const currentRangeSize = endTime - startTime;

                        if (distanceToEnd <= currentRangeSize) {
                            // Close enough - extend the range
                            setRangeEndDate(date);
                        } else {
                            // Far away - start new range
                            setRangeStartDate(date);
                            setRangeEndDate(null);
                        }
                    }
                }
            }
        }
    };

    const handleRefresh = () => {
        // Reset all demo states
        setModalVisible(false);
        setExpandableVisible(false);
        setLoading(false);
        setPasswordVisible(false);
        setSwitchValue(false);
        setNotificationsEnabled(true);
        setLottieAutoPlay(true);
        setLottieLoop(true);

        // Reset fetch states
        setFetchLoading(false);
        setFetchDelay('2');
        setFetchedData(null);
        setFetchExpandableVisible(false);

        // Reset DatePicker states
        setSingleSelectedDate(null);
        setRangeStartDate(null);
        setRangeEndDate(null);

        // Reset Dropdown states
        setSingleDropdownValue('');
        setMultiDropdownValue([]);
        setCountryValue('');
        setCategoryValue('');

        // Reset Phone Input states
        setPhoneValue('');
        setSelectedPhoneCountry(null);
        setPhoneValue2('');
        setSelectedPhoneCountry2(null);
        setPhoneValue3('');
        setSelectedPhoneCountry3(null);
        setPhoneValue4('');
        setSelectedPhoneCountry4(null);

        demoForm.resetForm();
    };

    const handleInfo = () => {
        setModalVisible(true);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'UI',
                    headerStyle: {
                        backgroundColor: isDark ? '#111827' : '#F9FAFB',
                    },
                    headerTintColor: isDark ? '#F9FAFB' : '#111827',
                    headerTitleStyle: {
                        fontWeight: '600',
                        fontSize: 18,
                    },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={handleRefresh}
                            style={styles.headerButton}
                        >
                            <Ionicons
                                name="refresh"
                                size={22}
                                color={isDark ? '#60A5FA' : '#3B82F6'}
                            />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleInfo}
                            style={styles.headerButton}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={22}
                                color={isDark ? '#60A5FA' : '#3B82F6'}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={isDark ? '#111827' : '#F9FAFB'}
            />
            <ScrollView style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.content}>
                    <Text style={[styles.pageTitle, isDark && styles.pageTitleDark]}>
                        Components
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

                            {/* Enhanced Loading States */}
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Enhanced Loading States
                            </Text>
                            <View style={styles.buttonRow}>
                                <Button
                                    title={loading ? "Loading..." : "Lottie Load"}
                                    loading={loading}
                                    onPress={handleLoadingDemo}
                                    variant="primary"
                                />
                                <Button
                                    title="Secondary Load"
                                    loading={loading}
                                    onPress={handleLoadingDemo}
                                    variant="secondary"
                                />
                            </View>
                            <View style={styles.buttonRow}>
                                <Button
                                    title="Outline Load"
                                    loading={loading}
                                    onPress={handleLoadingDemo}
                                    variant="outline"
                                />
                                <Button
                                    title="Ghost Load"
                                    loading={loading}
                                    onPress={handleLoadingDemo}
                                    variant="ghost"
                                />
                            </View>

                            {/* Always Loading Examples */}
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Always Loading (Demo)
                            </Text>
                            <View style={styles.buttonRow}>
                                <Button
                                    title="Always Loading"
                                    loading={true}
                                    onPress={() => { }} // No-op since it's always loading
                                    variant="primary"
                                />
                                <Button
                                    title="Processing..."
                                    loading={true}
                                    onPress={() => { }}
                                    variant="secondary"
                                />
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

                    {/* Dropdown Components */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Dropdown
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Dropdown and multi-select components with search functionality, theme-aware styling, and form validation support. Built with react-native-element-dropdown.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Single Selection
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Standard dropdown for selecting a single option
                            </Text>

                            <Dropdown
                                label="Basic Dropdown"
                                placeholder="Choose an option"
                                data={basicOptions}
                                value={singleDropdownValue}
                                onChange={(item: DropdownItem) => setSingleDropdownValue(item.value)}
                            />

                            <Dropdown
                                label="Country Selection"
                                placeholder="Select your country"
                                data={countryOptions}
                                value={countryValue}
                                onChange={(item: DropdownItem) => setCountryValue(item.value)}
                                search={true}
                                searchPlaceholder="Search countries..."
                            />

                            <Dropdown
                                label="Category with Search"
                                placeholder="Select category"
                                data={categoryOptions}
                                value={categoryValue}
                                onChange={(item: DropdownItem) => setCategoryValue(item.value)}
                                search={true}
                                searchPlaceholder="Search categories..."
                                maxHeight={200}
                            />
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Multi Selection
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Dropdown that allows selecting multiple options with chips
                            </Text>

                            <Dropdown
                                mode="multi"
                                label="Multiple Categories"
                                placeholder="Select multiple categories"
                                data={categoryOptions}
                                value={multiDropdownValue}
                                onChange={(items: string[]) => setMultiDropdownValue(items)}
                                search={true}
                                searchPlaceholder="Search categories..."
                            />
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                States & Validation
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Error states and disabled dropdowns
                            </Text>

                            <Dropdown
                                label="Disabled Dropdown"
                                placeholder="This dropdown is disabled"
                                data={basicOptions}
                                value=""
                                onChange={() => { }}
                                disable={true}
                            />

                            <Dropdown
                                label="Dropdown with Error"
                                placeholder="Select an option"
                                data={basicOptions}
                                value=""
                                onChange={() => { }}
                                error="This field is required"
                                touched={true}
                            />
                        </View>

                        {/* Show selected values */}
                        {(singleDropdownValue || countryValue || categoryValue || multiDropdownValue.length > 0) && (
                            <View style={[styles.expandableContent, isDark && styles.expandableContentDark]}>
                                <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                    Selected Values
                                </Text>
                                {singleDropdownValue && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Basic: {basicOptions.find(opt => opt.value === singleDropdownValue)?.label}
                                    </Text>
                                )}
                                {countryValue && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Country: {countryOptions.find(opt => opt.value === countryValue)?.label}
                                    </Text>
                                )}
                                {categoryValue && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Category: {categoryOptions.find(opt => opt.value === categoryValue)?.label}
                                    </Text>
                                )}
                                {multiDropdownValue.length > 0 && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Multiple: {multiDropdownValue.map(val =>
                                            categoryOptions.find(opt => opt.value === val)?.label
                                        ).join(', ')}
                                    </Text>
                                )}
                            </View>
                        )}
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
                                    Notifications
                                </Text>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Dark Mode Preview Component */}
                    <DarkModePreview />

                    {/* Lottie Animation Component */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Lottie Animation
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Showcase of Lottie animations with different sizes, controls, and the spinner.lottie file.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Different Sizes
                            </Text>
                            <View style={styles.lottieRow}>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Small</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="small"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                    />
                                </View>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Medium</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="medium"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                    />
                                </View>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Large</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="large"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Interactive Controls
                            </Text>
                            <View style={styles.lottieControlContainer}>
                                <LottieAnimation
                                    ref={lottieRef1}
                                    source={require('@/assets/lottie/spinner.lottie')}
                                    size="medium"
                                    autoPlay={false}
                                    loop={false}
                                />
                                <View style={styles.lottieButtons}>
                                    <Button
                                        title="Play"
                                        size="small"
                                        onPress={() => lottieRef1.current?.play()}
                                    />
                                    <Button
                                        title="Pause"
                                        size="small"
                                        onPress={() => lottieRef1.current?.pause()}
                                    />
                                    <Button
                                        title="Reset"
                                        size="small"
                                        onPress={() => lottieRef1.current?.reset()}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Color Variations
                            </Text>
                            <View style={styles.lottieRow}>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Default</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="medium"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                    />
                                </View>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Blue Theme</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="medium"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                        backgroundColor="rgba(59, 130, 246, 0.1)"
                                        colorFilters={[
                                            { keypath: "**", color: isDark ? "#60A5FA" : "#3B82F6" }
                                        ]}
                                    />
                                </View>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Green Theme</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="medium"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                        backgroundColor="rgba(16, 185, 129, 0.1)"
                                        colorFilters={[
                                            { keypath: "**", color: isDark ? "#34D399" : "#10B981" }
                                        ]}
                                    />
                                </View>
                            </View>
                            <View style={styles.lottieRow}>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Red Theme</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="medium"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                        backgroundColor="rgba(239, 68, 68, 0.1)"
                                        colorFilters={[
                                            { keypath: "**", color: isDark ? "#F87171" : "#EF4444" }
                                        ]}
                                    />
                                </View>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Purple Theme</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="medium"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                        backgroundColor="rgba(139, 92, 246, 0.1)"
                                        colorFilters={[
                                            { keypath: "**", color: isDark ? "#A78BFA" : "#8B5CF6" }
                                        ]}
                                    />
                                </View>
                                <View style={styles.lottieItem}>
                                    <Text style={[styles.iconLabel, isDark && styles.iconLabelDark]}>Orange Theme</Text>
                                    <LottieAnimation
                                        source={require('@/assets/lottie/spinner.lottie')}
                                        size="medium"
                                        autoPlay={lottieAutoPlay}
                                        loop={lottieLoop}
                                        backgroundColor="rgba(249, 115, 22, 0.1)"
                                        colorFilters={[
                                            { keypath: "**", color: isDark ? "#FB923C" : "#F97316" }
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Settings
                            </Text>
                            <View style={styles.switchRow}>
                                <Text style={[styles.switchLabel, isDark && styles.switchLabelDark]}>
                                    Auto Play
                                </Text>
                                <Switch
                                    value={lottieAutoPlay}
                                    onValueChange={setLottieAutoPlay}
                                />
                            </View>

                            <View style={styles.switchRow}>
                                <Text style={[styles.switchLabel, isDark && styles.switchLabelDark]}>
                                    Loop Animation
                                </Text>
                                <Switch
                                    value={lottieLoop}
                                    onValueChange={setLottieLoop}
                                />
                            </View>
                        </View>
                    </View>

                    {/* DatePicker Components */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Date Picker
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Theme-aware date pickers with single date and range selection modes. Built with react-native-calendar-picker and styled to match the app's design system.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Single Date Selection
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Pick a single date from the calendar
                            </Text>

                            <DatePicker
                                allowRangeSelection={false}
                                selectedStartDate={singleSelectedDate}
                                onDateChange={handleSingleDateChange}
                                minDate={new Date()}
                                startFromMonday={true}
                            />

                            {singleSelectedDate && (
                                <View style={[styles.expandableContent, isDark && styles.expandableContentDark]}>
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Selected date: {singleSelectedDate.toDateString()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Range Selection
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Select a date range (start and end dates)
                            </Text>

                            <DatePicker
                                allowRangeSelection={true}
                                allowBackwardRangeSelect={true}
                                selectedStartDate={rangeStartDate}
                                selectedEndDate={rangeEndDate}
                                onDateChange={handleRangeDateChange}
                                startFromMonday={true}
                            />

                            {(rangeStartDate || rangeEndDate) && (
                                <View style={[styles.expandableContent, isDark && styles.expandableContentDark]}>
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Start date: {rangeStartDate ? rangeStartDate.toDateString() : 'Not selected'}
                                    </Text>
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        End date: {rangeEndDate ? rangeEndDate.toDateString() : 'Not selected'}
                                    </Text>
                                    {rangeStartDate && rangeEndDate && (
                                        <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                            Duration: {Math.ceil((rangeEndDate.getTime() - rangeStartDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Data Fetching Component */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Data Fetching
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Fetch data from a public API with custom delay and loading states. Features a Lottie spinner button that shows while loading.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Fetch Configuration
                            </Text>

                            {/* Delay Input */}
                            <Input
                                label="Delay (seconds)"
                                placeholder="Enter delay in seconds"
                                value={fetchDelay}
                                onChangeText={setFetchDelay}
                                keyboardType="numeric"
                            />

                            {/* Fetch Button with Lottie Spinner */}
                            <View style={styles.fetchButtonContainer}>
                                <Button
                                    title={fetchLoading ? "Fetching..." : "Fetch Data"}
                                    onPress={fetchData}
                                    loading={fetchLoading}
                                    variant="primary"
                                />
                            </View>

                            {/* Results Expandable View */}
                            <ExpandableView expanded={fetchExpandableVisible}>
                                <View style={[styles.fetchResultsContainer, isDark && styles.fetchResultsContainerDark]}>
                                    <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                        API Response
                                    </Text>
                                    {fetchedData && (
                                        <View style={styles.jsonContainer}>
                                            <Text style={[styles.jsonText, isDark && styles.jsonTextDark]}>
                                                {JSON.stringify(fetchedData, null, 2)}
                                            </Text>
                                        </View>
                                    )}
                                    {fetchedData?.error && (
                                        <View style={[styles.errorContainer, isDark && styles.errorContainerDark]}>
                                            <Ionicons
                                                name="alert-circle"
                                                size={20}
                                                color={isDark ? '#F87171' : '#EF4444'}
                                                style={styles.errorIcon}
                                            />
                                            <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                                                Error: {fetchedData.message}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ExpandableView>
                        </View>
                    </View>

                    {/* Phone Input Component */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Phone Input
                        </Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            International phone number input with country selection, formatting, and validation. Features flag icons, automatic country detection, and theme-aware styling.
                        </Text>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Basic Usage
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Standard phone input with country selection and validation
                            </Text>

                            <PhoneInput
                                label="Phone Number"
                                placeholder="Enter your phone number"
                                value={phoneValue}
                                onChangePhoneNumber={setPhoneValue}
                                selectedCountry={selectedPhoneCountry}
                                onChangeSelectedCountry={setSelectedPhoneCountry}
                                defaultCountry="US"
                            />

                            {(phoneValue || selectedPhoneCountry) && (
                                <View style={[styles.expandableContent, isDark && styles.expandableContentDark]}>
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Country: {selectedPhoneCountry?.name?.en || 'Not selected'}
                                    </Text>
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Phone: {selectedPhoneCountry?.callingCode || ''} {phoneValue}
                                    </Text>
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Valid: {selectedPhoneCountry && phoneValue ?
                                            isValidPhoneNumber(phoneValue, selectedPhoneCountry) ? 'Yes' : 'No'
                                            : 'Unknown'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Error State
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Phone input with validation error
                            </Text>

                            <PhoneInput
                                label="Phone Number (Required)"
                                placeholder="Enter a valid phone number"
                                value={phoneValue2}
                                onChangePhoneNumber={setPhoneValue2}
                                selectedCountry={selectedPhoneCountry2}
                                onChangeSelectedCountry={setSelectedPhoneCountry2}
                                error="Please enter a valid phone number"
                                touched={true}
                                defaultCountry="GB"
                            />
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Pre-filled Value
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Phone input with default value in E.164 format
                            </Text>

                            <PhoneInput
                                label="Contact Number"
                                placeholder="Phone number"
                                value={phoneValue3}
                                onChangePhoneNumber={setPhoneValue3}
                                selectedCountry={selectedPhoneCountry3}
                                onChangeSelectedCountry={setSelectedPhoneCountry3}
                                defaultValue="+1234567890"
                                defaultCountry="CA"
                            />
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Limited Countries
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Show only specific countries with popular countries at top
                            </Text>

                            <PhoneInput
                                label="Business Phone"
                                placeholder="Select country and enter number"
                                value={phoneValue4}
                                onChangePhoneNumber={setPhoneValue4}
                                selectedCountry={selectedPhoneCountry4}
                                onChangeSelectedCountry={setSelectedPhoneCountry4}
                                showOnly={['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'BR']}
                                popularCountries={['US', 'CA', 'GB']}
                                defaultCountry="US"
                                language="en"
                            />
                        </View>

                        <View style={styles.componentGroup}>
                            <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                Disabled State
                            </Text>
                            <Text style={[styles.variantSubtitle, isDark && styles.variantSubtitleDark]}>
                                Phone input in disabled state
                            </Text>

                            <PhoneInput
                                label="Disabled Phone Input"
                                placeholder="This input is disabled"
                                value="+1 (555) 123-4567"
                                disabled={true}
                                defaultCountry="US"
                            />
                        </View>

                        {/* Show all phone input values */}
                        {(phoneValue || phoneValue2 || phoneValue3 || phoneValue4) && (
                            <View style={[styles.expandableContent, isDark && styles.expandableContentDark]}>
                                <Text style={[styles.variantTitle, isDark && styles.variantTitleDark]}>
                                    All Phone Numbers
                                </Text>
                                {phoneValue && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Basic: {selectedPhoneCountry?.callingCode || ''} {phoneValue}
                                    </Text>
                                )}
                                {phoneValue2 && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Error Demo: {selectedPhoneCountry2?.callingCode || ''} {phoneValue2}
                                    </Text>
                                )}
                                {phoneValue3 && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Pre-filled: {selectedPhoneCountry3?.callingCode || ''} {phoneValue3}
                                    </Text>
                                )}
                                {phoneValue4 && (
                                    <Text style={[styles.expandableText, isDark && styles.expandableTextDark]}>
                                        Limited: {selectedPhoneCountry4?.callingCode || ''} {phoneValue4}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="UI Components Showcase"
                message="This page demonstrates all available UI components in the design system. Use the refresh button in the header to reset all demo states, or interact with each component to see their different states and functionality."
                type="info"
                primaryButtonText="Got it"
                secondaryButtonText="Close"
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
    pageTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 32,
        letterSpacing: -0.5,
        textAlign: 'left',
    },
    pageTitleDark: {
        color: '#F9FAFB',
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
    lottieRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    lottieItem: {
        alignItems: 'center',
        gap: 8,
    },
    lottieControlContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
    },
    lottieButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
    },
    fetchButtonContainer: {
        marginBottom: 16,
    },
    fetchResultsContainer: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
        marginTop: 12,
    },
    fetchResultsContainerDark: {
        backgroundColor: '#1F2937',
    },
    jsonContainer: {
        marginTop: 12,
    },
    jsonText: {
        fontSize: 14,
        color: '#374151',
    },
    jsonTextDark: {
        color: '#D1D5DB',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    errorContainerDark: {
        backgroundColor: '#1F2937',
    },
    errorIcon: {
        marginRight: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#374151',
    },
    errorTextDark: {
        color: '#D1D5DB',
    },
    variantSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    variantSubtitleDark: {
        color: '#9CA3AF',
    },
}); 