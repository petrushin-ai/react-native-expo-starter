import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useMemo } from 'react'
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native'
// @ts-ignore - react-native-calendar-picker doesn't have official types
import CalendarPicker from 'react-native-calendar-picker'

export interface DatePickerProps {
    allowRangeSelection?: boolean
    allowBackwardRangeSelect?: boolean
    selectedStartDate?: Date | null
    selectedEndDate?: Date | null
    onDateChange?: (date: Date, type?: 'START_DATE' | 'END_DATE') => void
    minDate?: Date
    maxDate?: Date
    initialDate?: Date
    width?: DimensionValue
    startFromMonday?: boolean
    previousTitle?: string
    nextTitle?: string
    dayLabelsWrapper?: object
    monthYearHeaderWrapperStyle?: object
    headerWrapperStyle?: object
    monthTitleStyle?: object
    yearTitleStyle?: object
    previousTitleStyle?: object
    nextTitleStyle?: object
    customDatesStyles?: any[]
    disabledDates?: Date[] | ((date: Date) => boolean)
    restrictMonthNavigation?: boolean
    scrollable?: boolean
}

export function DatePicker({
    allowRangeSelection = false,
    allowBackwardRangeSelect = false,
    selectedStartDate = null,
    selectedEndDate = null,
    onDateChange,
    minDate,
    maxDate,
    initialDate,
    width,
    startFromMonday = true,
    previousTitle,
    nextTitle,
    dayLabelsWrapper,
    monthYearHeaderWrapperStyle,
    headerWrapperStyle,
    monthTitleStyle,
    yearTitleStyle,
    previousTitleStyle,
    nextTitleStyle,
    customDatesStyles,
    disabledDates,
    restrictMonthNavigation = false,
    scrollable = false,
    ...props
}: DatePickerProps) {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    // Theme-aware calendar colors following the existing Calendar component pattern
    const calendarColors = useMemo(() => ({
        // Selected day colors - use primary tint color for both light and dark modes
        selectedDayColor: colors.tint,
        selectedDayTextColor: colorScheme === 'dark' ? colors.background : '#FFFFFF',

        // Range selection colors with proper theme support
        selectedRangeStartStyle: {
            backgroundColor: colors.tint,
        },
        selectedRangeEndStyle: {
            backgroundColor: colors.tint,
        },
        selectedRangeStyle: {
            backgroundColor: colors.tint, // Same solid color as start/end dates
        },

        // Range text colors for proper contrast
        selectedRangeStartTextStyle: {
            color: colorScheme === 'dark' ? colors.background : '#FFFFFF',
            fontWeight: '600' as const,
        },
        selectedRangeEndTextStyle: {
            color: colorScheme === 'dark' ? colors.background : '#FFFFFF',
            fontWeight: '600' as const,
        },
        selectedDayTextStyle: {
            color: colorScheme === 'dark' ? colors.background : '#FFFFFF',
            fontWeight: '600' as const,
        },

        // Today colors with theme awareness
        todayBackgroundColor: colors.tint,
        todayTextStyle: {
            color: '#FFFFFF',
            fontWeight: '600' as const,
        },

        // Text styling with theme support
        textStyle: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '400' as const,
        },

        // Disabled dates
        disabledDatesTextStyle: {
            color: colors.muted,
            textDecorationLine: 'line-through' as const,
        },

        // Day labels (weekdays) with minimal styling to preserve layout
        dayLabelsWrapper: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingVertical: 8,
            ...dayLabelsWrapper,
        },

        // Header styling with minimal padding to preserve layout
        monthYearHeaderWrapperStyle: {
            backgroundColor: colors.background,
            paddingVertical: 12,
            ...monthYearHeaderWrapperStyle,
        },
        headerWrapperStyle: {
            backgroundColor: colors.background,
            ...headerWrapperStyle,
        },
        monthTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '600' as const,
            ...monthTitleStyle,
        },
        yearTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '600' as const,
            ...yearTitleStyle,
        },

        // Navigation buttons - will be overridden by custom components
        previousTitleStyle: {
            color: colors.tint,
            fontSize: 16,
            fontWeight: '500' as const,
            ...previousTitleStyle,
        },
        nextTitleStyle: {
            color: colors.tint,
            fontSize: 16,
            fontWeight: '500' as const,
            ...nextTitleStyle,
        },
    }), [colors, colorScheme, dayLabelsWrapper, monthYearHeaderWrapperStyle, headerWrapperStyle, monthTitleStyle, yearTitleStyle, previousTitleStyle, nextTitleStyle])

    const containerStyle: ViewStyle = useMemo(() => ({
        ...styles.container,
        backgroundColor: colors.background,
        borderColor: colors.border,
        width: width || '100%',
    }), [colors, width])

    // Custom chevron components
    const renderPreviousComponent = () => (
        <Ionicons
            name="chevron-back"
            size={24}
            color={colors.tint}
        />
    )

    const renderNextComponent = () => (
        <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.tint}
        />
    )

    // Only apply minDate restriction for single date selection, not for range selection
    const effectiveMinDate = allowRangeSelection ? undefined : minDate

    return (
        <View style={containerStyle}>
            <CalendarPicker
                startFromMonday={startFromMonday}
                allowRangeSelection={allowRangeSelection}
                allowBackwardRangeSelect={allowBackwardRangeSelect}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                onDateChange={onDateChange}
                minDate={effectiveMinDate}
                maxDate={maxDate}
                initialDate={initialDate}
                customDatesStyles={customDatesStyles}
                disabledDates={disabledDates}
                restrictMonthNavigation={restrictMonthNavigation}
                scrollable={scrollable}
                // Ensure proper calendar width
                width={320} // Set explicit width for consistent sizing
                // Custom chevron components
                previousComponent={renderPreviousComponent()}
                nextComponent={renderNextComponent()}
                // Apply theme colors
                selectedDayColor={calendarColors.selectedDayColor}
                selectedDayTextColor={calendarColors.selectedDayTextColor}
                selectedRangeStartStyle={calendarColors.selectedRangeStartStyle}
                selectedRangeEndStyle={calendarColors.selectedRangeEndStyle}
                selectedRangeStyle={calendarColors.selectedRangeStyle}
                selectedRangeStartTextStyle={calendarColors.selectedRangeStartTextStyle}
                selectedRangeEndTextStyle={calendarColors.selectedRangeEndTextStyle}
                selectedDayTextStyle={calendarColors.selectedDayTextStyle}
                todayBackgroundColor={calendarColors.todayBackgroundColor}
                todayTextStyle={calendarColors.todayTextStyle}
                textStyle={calendarColors.textStyle}
                disabledDatesTextStyle={calendarColors.disabledDatesTextStyle}
                dayLabelsWrapper={calendarColors.dayLabelsWrapper}
                monthYearHeaderWrapperStyle={calendarColors.monthYearHeaderWrapperStyle}
                headerWrapperStyle={calendarColors.headerWrapperStyle}
                monthTitleStyle={calendarColors.monthTitleStyle}
                yearTitleStyle={calendarColors.yearTitleStyle}
                previousTitleStyle={calendarColors.previousTitleStyle}
                nextTitleStyle={calendarColors.nextTitleStyle}
                // Responsive scaling
                scaleFactor={375}
                // Additional props
                {...props}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
    },
}) 