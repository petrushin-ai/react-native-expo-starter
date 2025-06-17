import { Colors } from '@/constants/Colors'
import { FLOATING_TAB_BAR_COMPENSATION } from '@/constants/Layout'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useResponsiveColumns } from '@/hooks/useResponsive'
import { CalendarDayType, CalendarEvent, CalendarEventDay, MyCalendarItem } from '@/types/calendar'
import { addDays, addMonths, format, isBefore, isSameDay, isSameMonth, parseISO, startOfDay, subMonths } from 'date-fns'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'


interface CalendarProps {
    days: MyCalendarItem[]
    onDayPress?: (day: MyCalendarItem) => void
    selectedMonth?: string
    isLoadingMore?: boolean
    loadAdditionalMonths?: (range: { start: Date; end: Date }) => Promise<void>
}

const CALENDAR_PADDING = 16
const DAYS_IN_WEEK = 7
const CELL_HEIGHT = 60
const BOOKING_HEIGHT = 22
const BOOKING_VERTICAL_MARGIN = 3
const CELL_SIZE_FOR_TEXT = 35

// Responsive calendar dimensions that react to screen width changes
const getCalendarDimensions = (numColumns: number, isTablet: boolean, screenWidth: number) => {
    const totalPadding = CALENDAR_PADDING * 2
    const columnGap = isTablet ? 16 : 0 // Gap between columns on tablets
    const totalGaps = (numColumns - 1) * columnGap
    const availableWidth = screenWidth - totalPadding - totalGaps
    const calendarWidth = Math.floor(availableWidth / numColumns)
    const cellWidth = Math.floor(calendarWidth / DAYS_IN_WEEK)

    return {
        calendarWidth,
        cellWidth,
        columnGap
    }
}

// Helper function to get all days for a month grid (only show weeks that contain current month days)
const getMonthDays = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay() || 7 // Convert Sunday (0) to 7
    const adjustedFirstDay = firstDayOfWeek - 1 // Adjust for Monday start

    const days: Date[] = []

    // Add days from previous month to fill the first week
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        days.push(addDays(firstDay, -i - 1))
    }

    // Add all days of current month
    const daysInMonth = lastDay.getDate()
    for (let i = 0; i < daysInMonth; i++) {
        days.push(new Date(year, month, i + 1))
    }

    // Only add days from next month to complete the last week (not full rows)
    const lastDayOfWeek = lastDay.getDay() || 7 // Convert Sunday (0) to 7
    const adjustedLastDay = lastDayOfWeek === 7 ? 0 : 7 - lastDayOfWeek // Days needed to complete week
    const nextMonthStart = new Date(year, month + 1, 1)
    for (let i = 0; i < adjustedLastDay; i++) {
        days.push(addDays(nextMonthStart, i))
    }

    return days
}

// Helper function to check if two calendar days are the same event (IMPROVED for edge cases)
const isTheSameEvent = (
    calendarsObject: Record<string, MyCalendarItem | undefined>,
    date1: Date,
    date2: Date
): boolean => {
    const date1String = format(date1, 'yyyy-MM-dd')
    const date2String = format(date2, 'yyyy-MM-dd')

    const day1 = calendarsObject[date1String]
    const day2 = calendarsObject[date2String]

    // Both days must exist and have the same status
    if (!day1 || !day2 || day1.status !== day2.status) {
        return false
    }

    // Skip available days (they don't form events)
    if (day1.status === 'available' || day2.status === 'available') {
        return false
    }

    // For booked days, compare reservation IDs first (most reliable)
    if (day1.status === 'booked' && day2.status === 'booked') {
        // Both must have reservations to be considered the same event
        if (!day1.reservation || !day2.reservation) {
            return false
        }

        // Primary check: same reservation ID
        if (day1.reservation.id === day2.reservation.id) {
            return true
        }

        // Fallback: same channel and guest (in case of ID issues)
        const sameChannel = day1.reservation.channel === day2.reservation.channel
        const sameGuest = day1.reservation.guestName === day2.reservation.guestName
        const sameCheckIn = day1.reservation.checkIn === day2.reservation.checkIn

        return sameChannel && sameGuest && sameCheckIn
    }

    // For unavailable days, compare notes (must be identical)
    if (day1.status === 'unavailable' && day2.status === 'unavailable') {
        return day1.note === day2.note && day1.note !== undefined && day1.note !== ''
    }

    return false
}

// Generate unique UUID (simplified version)
const generateUniqueUUID = (): string => {
    return `${Date.now()}_${Math.random()}`
}

export default function Calendar({
    days,
    onDayPress,
    selectedMonth = '',
    isLoadingMore = false,
    loadAdditionalMonths
}: CalendarProps) {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    // Theme-aware calendar colors
    const calendarColors = useMemo(() => ({
        booking: {
            active: colors.tint,
            inactive: colors.muted,
            pastActive: colors.tint + '80', // Add transparency for past bookings
            text: '#FFFFFF',
        },
        cell: {
            background: {
                current: colors.background,
                other: colors.surface,
                past: colors.surface,
            },
            border: colors.border,
            text: {
                default: colors.text,
                disabled: colors.muted,
                otherMonth: colors.placeholder,
            },
        },
        weekday: {
            text: colors.muted,
        },
    }), [colors])

    const today = startOfDay(new Date())
    const scrollViewRef = useRef<ScrollView>(null)
    const [isLoadingUI, setIsLoadingUI] = useState(false)
    const [loadingDirection, setLoadingDirection] = useState<'previous' | 'next' | null>(null)
    const [isLoadingTop, setIsLoadingTop] = useState(false)
    const [isLoadingBottom, setIsLoadingBottom] = useState(false)
    const [pullState, setPullState] = useState<{
        direction: 'top' | 'bottom' | null
        distance: number
        isTriggered: boolean
    }>({ direction: null, distance: 0, isTriggered: false })
    const [isOrientationChanging, setIsOrientationChanging] = useState(false)

    // Get responsive layout information
    const { numColumns, isTablet, isLandscape, screenWidth } = useResponsiveColumns()
    const { calendarWidth, cellWidth, columnGap } = getCalendarDimensions(numColumns, isTablet, screenWidth)

    const [monthsRange, setMonthsRange] = useState(() => {
        // Initialize with appropriate number of months based on layout
        const baseMonth = parseISO(`${selectedMonth}-01`)

        // Determine initial months to load based on device type
        let totalMonths: number
        if (isTablet && isLandscape) {
            totalMonths = 6 // Tablet landscape: 6 months
        } else if (isTablet) {
            totalMonths = 4 // Tablet portrait: 4 months  
        } else {
            totalMonths = 3 // Phone: 3 months
        }

        const monthsBefore = Math.floor((totalMonths - 1) / 2)
        const monthsAfter = totalMonths - 1 - monthsBefore

        return {
            start: subMonths(baseMonth, monthsBefore),
            end: addMonths(baseMonth, monthsAfter),
            selectedMonth: baseMonth
        }
    })

    // Generate months to show based on current range
    const monthsToShow = useMemo(() => {
        const months: Date[] = []
        let currentMonth = monthsRange.start

        while (currentMonth <= monthsRange.end) {
            months.push(new Date(currentMonth))
            currentMonth = addMonths(currentMonth, 1)
        }

        return months
    }, [monthsRange, numColumns, isTablet, isLandscape])

    // Create a map of date strings to calendar items (EXACT web implementation)
    const calendarsObject = useMemo(() => {
        const obj = Object.fromEntries(days.map(calendar => [
            calendar.date,
            calendar
        ]))
        return obj
    }, [days])

    // Process calendar days into events (IMPROVED: Fix date merging and event consistency)
    const events = useMemo(() => {
        const events: Record<string, CalendarEvent> = {}

        console.log('🎯 Starting event processing:', {
            totalDays: days.length,
            dateRange: days.length > 0 ? {
                first: days[0]?.date,
                last: days[days.length - 1]?.date
            } : null
        })

        // Process days in chronological order (not reversed)
        const daysToProcess = [...days].sort((a, b) => a.date.localeCompare(b.date))

        let currentEventId: string | null = null
        let consecutiveDayCount = 0

        daysToProcess.forEach((currentCalendarDay, index) => {
            const dateString = currentCalendarDay.date
            const currentDay = parseISO(dateString)

            const currentCalendarDayStatus = currentCalendarDay.status
            if (currentCalendarDayStatus !== 'booked' && currentCalendarDayStatus !== 'unavailable') {
                // Reset event tracking when hitting available day
                currentEventId = null
                consecutiveDayCount = 0
                return
            }

            // Check if this day continues the previous event
            let isPartOfPreviousEvent = false

            if (currentEventId && index > 0) {
                const previousCalendarDay = daysToProcess[index - 1]
                const previousDay = parseISO(previousCalendarDay.date)

                // Check if this day is consecutive to the previous day
                const expectedPreviousDay = addDays(currentDay, -1)
                const isConsecutiveDay = isSameDay(previousDay, expectedPreviousDay)

                // Check if it's the same event (same reservation ID or same note)
                const isSameEventType = isTheSameEvent(calendarsObject, currentDay, previousDay)

                isPartOfPreviousEvent = isConsecutiveDay && isSameEventType

                // Debug logging for event continuity
                if (consecutiveDayCount > 0) {
                    console.log('🔗 Event continuity check:', {
                        currentDate: dateString,
                        previousDate: previousCalendarDay.date,
                        isConsecutive: isConsecutiveDay,
                        isSameEvent: isSameEventType,
                        isPartOfPrevious: isPartOfPreviousEvent,
                        currentEventId: currentEventId?.slice(-8),
                        consecutiveDays: consecutiveDayCount + 1
                    })
                }
            }

            if (!isPartOfPreviousEvent) {
                // Start a new event
                currentEventId = generateUniqueUUID()
                consecutiveDayCount = 0

                const label = currentCalendarDay.reservation?.channel || currentCalendarDay.note || ''
                events[currentEventId] = {
                    dates: [currentDay],
                    label,
                    type: currentCalendarDayStatus as 'booked' | 'unavailable'
                }

                console.log('🆕 New event started:', {
                    eventId: currentEventId.slice(-8),
                    date: dateString,
                    type: currentCalendarDayStatus,
                    label: label || '(no label)',
                    reservationId: currentCalendarDay.reservation?.id?.slice(-8) || 'none'
                })
            } else if (currentEventId) {
                // Continue existing event
                events[currentEventId].dates.push(currentDay)

                console.log('➕ Event continued:', {
                    eventId: currentEventId.slice(-8),
                    date: dateString,
                    spanLength: events[currentEventId].dates.length,
                    consecutiveDays: consecutiveDayCount + 1
                })
            }

            consecutiveDayCount++
        })

        // Sort dates within each event to ensure proper chronological order
        Object.keys(events).forEach(eventId => {
            events[eventId].dates.sort((a, b) => a.getTime() - b.getTime())
        })

        console.log('✅ Events processed successfully:', {
            eventsCount: Object.keys(events).length,
            events: Object.entries(events).map(([eventId, event]) => ({
                id: eventId.slice(-8),
                type: event.type,
                label: event.label || '(no label)',
                datesCount: event.dates.length,
                dateRange: event.dates.length > 0 ? {
                    start: format(event.dates[0], 'yyyy-MM-dd'),
                    end: format(event.dates[event.dates.length - 1], 'yyyy-MM-dd')
                } : null
            })).slice(0, 10) // Show first 10 events only
        })

        return events
    }, [days, calendarsObject])

    // Create eventsByDate mapping (IMPROVED: Add validation and better error handling)
    const eventsByDate = useMemo(() => {
        const dates: Record<string, CalendarEventDay> = {}

        console.log('🗓️ Creating eventsByDate mapping from', Object.keys(events).length, 'events')

        Object.keys(events).forEach(eventId => {
            const event = events[eventId]

            // Validate event data
            if (!event || !Array.isArray(event.dates) || event.dates.length === 0) {
                console.warn(`⚠️ Invalid event data for event ${eventId.slice(-8)}:`, event)
                return
            }

            // Ensure dates are sorted chronologically for proper indexing
            const sortedDates = [...event.dates].sort((a, b) => a.getTime() - b.getTime())

            if (sortedDates.length !== event.dates.length) {
                console.warn(`⚠️ Event ${eventId.slice(-8)} had unsorted dates, fixed`)
            }

            sortedDates.forEach((date, index) => {
                try {
                    const dateString = format(date, 'yyyy-MM-dd')

                    // Validate that this date isn't already assigned to another event
                    if (dates[dateString]) {
                        console.warn(`⚠️ Date conflict: ${dateString} is assigned to multiple events`, {
                            existingEvent: dates[dateString].id.slice(-8),
                            newEvent: eventId.slice(-8)
                        })
                    }

                    dates[dateString] = {
                        id: eventId,
                        type: event.type,
                        label: event.label || '',
                        length: sortedDates.length,
                        eventDayIndex: index // This will now be correctly 0-based chronologically
                    }
                } catch (error) {
                    console.error(`❌ Error processing date for event ${eventId.slice(-8)}:`, error, date)
                }
            })

            // Log event details for debugging
            if (sortedDates.length > 1) {
                console.log(`📅 Event ${eventId.slice(-8)} mapped:`, {
                    type: event.type,
                    label: event.label || '(no label)',
                    dateRange: `${format(sortedDates[0], 'yyyy-MM-dd')} to ${format(sortedDates[sortedDates.length - 1], 'yyyy-MM-dd')}`,
                    length: sortedDates.length,
                    indexRange: `0 to ${sortedDates.length - 1}`
                })
            }
        })

        console.log('✅ EventsByDate mapping completed:', {
            totalMappedDates: Object.keys(dates).length,
            eventSpanSummary: Object.values(dates).reduce((summary, eventDay) => {
                const key = `${eventDay.type}_${eventDay.length}days`
                summary[key] = (summary[key] || 0) + 1
                return summary
            }, {} as Record<string, number>)
        })

        return dates
    }, [events])

    // Calculate scroll position to center on selected month
    const scrollToSelectedMonth = () => {
        if (scrollViewRef.current && monthsToShow.length > 0) {
            // For responsive layout, we need to calculate based on rows
            const selectedMonthIndex = monthsToShow.findIndex(month =>
                isSameMonth(month, monthsRange.selectedMonth)
            )

            if (selectedMonthIndex === -1) return // Selected month not found

            // Calculate which row contains the selected month
            const selectedRowIndex = Math.floor(selectedMonthIndex / numColumns)

            // Calculate total height of all rows before the selected row
            let totalHeight = 0

            // Group months into rows for calculation
            const monthRows: Date[][] = []
            for (let i = 0; i < monthsToShow.length; i += numColumns) {
                monthRows.push(monthsToShow.slice(i, i + numColumns))
            }

            for (let rowIndex = 0; rowIndex < selectedRowIndex; rowIndex++) {
                const monthRow = monthRows[rowIndex]
                if (monthRow.length > 0) {
                    // Calculate height for this row (all months in a row have the same height)
                    const month = monthRow[0] // Use first month to calculate row height
                    const year = month.getFullYear()
                    const monthIndex = month.getMonth()
                    const monthDays = getMonthDays(year, monthIndex)
                    const monthWeeks = Math.ceil(monthDays.length / 7)

                    // Calculate height components for this row
                    const monthHeaderHeight = 16 + 16 + 16 // marginVertical + fontSize from styles
                    const weekDayHeight = 12 + 12 // weekday text + marginBottom
                    const calendarGridHeight = monthWeeks * CELL_HEIGHT // actual weeks * cell height
                    const monthBottomMargin = 32 // from styles
                    const borderHeight = 1 // top border of calendar grid

                    totalHeight += monthHeaderHeight + weekDayHeight + calendarGridHeight + monthBottomMargin + borderHeight
                }
            }

            // Use a small delay to ensure the component is fully rendered
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    y: totalHeight,
                    animated: false // No animation on initial load for better UX
                })
            }, 150) // Slightly longer delay to ensure full render
        }
    }

    // Handle orientation changes using Dimensions API
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setIsOrientationChanging(true)
            setTimeout(() => {
                setIsOrientationChanging(false)
            }, 300)
        })

        return () => {
            subscription?.remove()
        }
    }, [])

    // Update months range when selectedMonth or orientation changes
    useEffect(() => {
        const baseMonth = parseISO(`${selectedMonth}-01`)

        // Determine total months to load based on device type
        let totalMonths: number
        if (isTablet && isLandscape) {
            totalMonths = 6 // Tablet landscape: 6 months
        } else if (isTablet) {
            totalMonths = 4 // Tablet portrait: 4 months  
        } else {
            totalMonths = 3 // Phone: 3 months
        }

        const monthsBefore = Math.floor((totalMonths - 1) / 2)
        const monthsAfter = totalMonths - 1 - monthsBefore

        setMonthsRange({
            start: subMonths(baseMonth, monthsBefore),
            end: addMonths(baseMonth, monthsAfter),
            selectedMonth: baseMonth
        })
    }, [selectedMonth, numColumns, isTablet, isLandscape])

    // Scroll to selected month only on initial load or when selectedMonth changes
    useEffect(() => {
        let expectedInitialMonths: number
        if (isTablet && isLandscape) {
            expectedInitialMonths = 6 // Tablet landscape: 6 months
        } else if (isTablet) {
            expectedInitialMonths = 4 // Tablet portrait: 4 months  
        } else {
            expectedInitialMonths = 3 // Phone: 3 months
        }

        const isInitialLoad = monthsToShow.length === expectedInitialMonths
        if (isInitialLoad && !isOrientationChanging) {
            scrollToSelectedMonth()
        }
    }, [selectedMonth, numColumns, isTablet, isLandscape, isOrientationChanging])

    // Load previous months with haptic feedback
    const loadPreviousMonths = useCallback(async () => {
        if (isLoadingMore || isLoadingTop) return

        setIsLoadingTop(true)
        setLoadingDirection('previous')

        // Haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Calculate new range with appropriate number of months at the beginning
        const monthsToAdd = numColumns
        const newRange = {
            start: subMonths(monthsRange.start, monthsToAdd),
            end: monthsRange.end
        }

        // Load additional data if function is provided
        if (loadAdditionalMonths) {
            try {
                await loadAdditionalMonths(newRange)
            } catch (error) {
                console.log('Error loading additional months:', error)
            }
        }

        // Update UI range
        setMonthsRange(prev => ({
            ...prev,
            start: subMonths(prev.start, monthsToAdd)
        }))

        // Small delay to show loading state
        setTimeout(() => {
            setIsLoadingTop(false)
            setLoadingDirection(null)
        }, 500)
    }, [isLoadingMore, isLoadingTop, monthsRange, loadAdditionalMonths, numColumns])

    // Load next months by pulling at bottom
    const loadNextMonths = useCallback(async () => {
        if (isLoadingMore || isLoadingBottom) return

        setIsLoadingBottom(true)
        setLoadingDirection('next')

        // Haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Calculate new range with appropriate number of months at the end
        const monthsToAdd = numColumns
        const newRange = {
            start: monthsRange.start,
            end: addMonths(monthsRange.end, monthsToAdd)
        }

        // Load additional data if function is provided
        if (loadAdditionalMonths) {
            try {
                await loadAdditionalMonths(newRange)
            } catch (error) {
                console.log('Error loading additional months:', error)
            }
        }

        // Update UI range
        setMonthsRange(prev => ({
            ...prev,
            end: addMonths(prev.end, monthsToAdd)
        }))

        // Small delay to show loading state
        setTimeout(() => {
            setIsLoadingBottom(false)
            setLoadingDirection(null)
        }, 500)
    }, [isLoadingMore, isLoadingBottom, monthsRange, loadAdditionalMonths, numColumns])

    // Helper function to check if close to bottom
    const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }: {
        layoutMeasurement: { height: number }
        contentOffset: { y: number }
        contentSize: { height: number }
    }) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    }, [])

    // Handle scroll events for pull detection (iOS) and bottom detection (Android)
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
        const scrollY = contentOffset.y
        const contentHeight = contentSize.height
        const scrollViewHeight = layoutMeasurement.height

        // Don't track pulls if already loading
        if (isLoadingTop || isLoadingBottom) return

        if (Platform.OS === 'ios') {
            // iOS: Use pull detection for both top and bottom
            const PULL_THRESHOLD = 60 // Distance needed to trigger load

            // Detect top pull (negative scroll)
            if (scrollY < -20) {
                const pullDistance = Math.abs(scrollY)
                const isTriggered = pullDistance >= PULL_THRESHOLD

                setPullState({
                    direction: 'top',
                    distance: pullDistance,
                    isTriggered
                })
            }
            // Detect bottom pull (scroll beyond content)
            else if (scrollY + scrollViewHeight > contentHeight + 20) {
                const pullDistance = (scrollY + scrollViewHeight) - contentHeight
                const isTriggered = pullDistance >= PULL_THRESHOLD

                setPullState({
                    direction: 'bottom',
                    distance: pullDistance,
                    isTriggered
                })
            }
            // Reset pull state when not pulling
            else {
                setPullState({ direction: null, distance: 0, isTriggered: false })
            }
        } else {
            // Android: Use simple bottom detection in scroll listener
            if (isCloseToBottom(event.nativeEvent)) {
                loadNextMonths()
            }
        }
    }, [isLoadingTop, isLoadingBottom, isCloseToBottom, loadNextMonths])

    // Handle scroll end to trigger loading (iOS only)
    const handleScrollEndDrag = useCallback(() => {
        if (Platform.OS === 'ios' && pullState.isTriggered && !isLoadingTop && !isLoadingBottom) {
            if (pullState.direction === 'top') {
                loadPreviousMonths()
            } else if (pullState.direction === 'bottom') {
                loadNextMonths()
            }
        }
        // Reset pull state
        setPullState({ direction: null, distance: 0, isTriggered: false })
    }, [pullState, loadPreviousMonths, loadNextMonths, isLoadingTop, isLoadingBottom])

    const renderWeekDayNames = () => {
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return (
            <View style={styles.weekDayContainer}>
                {weekDays.map((day) => (
                    <View key={day} style={[styles.weekDayCell, { width: cellWidth }]}>
                        <Text style={[styles.weekDayText, { color: calendarColors.weekday.text }]}>{day}</Text>
                    </View>
                ))}
            </View>
        )
    }

    const renderDay = (currentDay: Date, monthDate: Date, dayIndex: number, totalDays: number) => {
        const isCurrentMonth = isSameMonth(currentDay, monthDate)
        const isPastDate = isBefore(currentDay, today) && !isSameDay(currentDay, today)
        const isToday = isSameDay(currentDay, today)

        const dateStringCurrentDay = format(currentDay, 'yyyy-MM-dd')
        const previousDay = addDays(currentDay, -1)
        const dateStringPreviousDay = format(previousDay, 'yyyy-MM-dd')

        const calendarDay: CalendarDayType = {
            date: currentDay,
            isHighlighted: false,
            isHighlightedStart: false,
            isHighlightedEnd: false,
            isActiveStart: false,
            isActiveEnd: false,
            isActive: false,
            isUnavailable: false,
            noteSpanLength: 0
        }

        const dateEvent = eventsByDate[dateStringCurrentDay]
        const previousDateEvent = eventsByDate[dateStringPreviousDay]

        if (dateEvent || previousDateEvent) {
            calendarDay.isActive = true
        }

        if (dateEvent) {
            calendarDay.isActiveStart = dateEvent.eventDayIndex === 0
            calendarDay.isUnavailable = dateEvent.type === 'unavailable'
            calendarDay.isHighlighted = !calendarDay.isUnavailable
            calendarDay.isHighlightedStart = calendarDay.isActiveStart && calendarDay.isHighlighted

            if (calendarDay.isActiveStart) {
                calendarDay.noteSpanLength = dateEvent.length
            }
        }

        if (previousDateEvent) {
            calendarDay.isActiveEnd = previousDateEvent.eventDayIndex === previousDateEvent.length - 1
            calendarDay.isHighlightedEnd = previousDateEvent.type === 'booked'
        }

        calendarDay.note = dateEvent?.label || previousDateEvent?.label

        if (calendarDay.isUnavailable && calendarDay.isActiveStart && calendarDay.note) {
            calendarDay.noteSpanLength = calendarDay.noteSpanLength || dateEvent?.length || 1
        }

        if (calendarDay.noteSpanLength && calendarDay.noteSpanLength <= 1) {
            if (calendarDay.isActiveEnd) {
                calendarDay.noteSpanLength = 0
            }
        }

        const isOwnerStay = calendarDay.note?.toLowerCase().includes('owner')
        const isPastBookingStart = isPastDate && calendarDay.isHighlightedStart && dateEvent?.type === 'booked' && !isOwnerStay
        const isPastBookingEnd = isPastDate && calendarDay.isHighlightedEnd && previousDateEvent?.type === 'booked' && !isOwnerStay
        const isPastBookingMiddle = isPastDate && calendarDay.isHighlighted && !calendarDay.isActiveStart && !calendarDay.isActiveEnd && dateEvent?.type === 'booked' && !isOwnerStay

        if (isOwnerStay) {
            calendarDay.isHighlighted = false
            calendarDay.isHighlightedStart = false
            calendarDay.isHighlightedEnd = false
        }

        let backgroundColor = calendarColors.cell.background.current
        if (!isCurrentMonth) {
            backgroundColor = calendarColors.cell.background.other
        } else if (isPastDate) {
            backgroundColor = calendarColors.cell.background.past
        }

        const zIndex = totalDays - dayIndex

        // Calculate precise event span dimensions
        const eventSpanWidth = calendarDay.noteSpanLength && calendarDay.noteSpanLength > 1
            ? (cellWidth * calendarDay.noteSpanLength) - 8 // Full span minus margins
            : cellWidth - 8 // Single cell minus margins

        return (
            <View key={currentDay.toISOString()} style={[
                styles.dayCell,
                { backgroundColor, zIndex, width: cellWidth, borderColor: calendarColors.cell.border }
            ]}>
                <View style={styles.dayHeader}>
                    <Text
                        style={[
                            styles.dayText,
                            { color: calendarColors.cell.text.default },
                            !isCurrentMonth && { color: calendarColors.cell.text.otherMonth },
                            isPastDate && isCurrentMonth && { color: calendarColors.cell.text.disabled },
                            isToday && styles.todayText,
                        ]}
                    >
                        {currentDay.getDate()}
                    </Text>
                </View>

                {/* Render booking events */}
                {calendarDay.isActiveStart && (
                    <View style={styles.dayBody}>
                        <View style={[
                            styles.selection,
                            styles.selectionStart,
                            // If this is also the end (single day event), add right rounding
                            (calendarDay.isActiveEnd && calendarDay.isActiveStart) && {
                                borderTopRightRadius: 11,
                                borderBottomRightRadius: 11,
                            },
                            {
                                width: eventSpanWidth,
                                backgroundColor: calendarDay.isHighlightedStart ?
                                    (isPastBookingStart ? calendarColors.booking.pastActive : calendarColors.booking.active) :
                                    calendarColors.booking.inactive
                            }
                        ]}>
                            {calendarDay.note &&
                                typeof calendarDay.note === 'string' &&
                                calendarDay.note.trim() !== '' &&
                                (calendarDay.isHighlighted || calendarDay.isUnavailable) && (
                                    <Text
                                        style={[
                                            styles.selectionText,
                                            {
                                                color: calendarColors.booking.text,
                                                maxWidth: eventSpanWidth - 16, // Account for padding
                                            }
                                        ]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        allowFontScaling={false}
                                    >
                                        {String(calendarDay.note).trim()}
                                    </Text>
                                )}
                        </View>
                    </View>
                )}

                {/* Render end of booking */}
                {calendarDay.isActiveEnd && !calendarDay.isActiveStart && (
                    <View style={styles.dayBody}>
                        <View style={[
                            styles.selection,
                            styles.selectionEnd,
                            {
                                width: cellWidth - 4, // Full cell width minus right margin
                                backgroundColor: calendarDay.isHighlightedEnd ?
                                    (isPastBookingEnd ? calendarColors.booking.pastActive : calendarColors.booking.active) :
                                    calendarColors.booking.inactive
                            }
                        ]} />
                    </View>
                )}

                {/* Render middle of booking continuation */}
                {!calendarDay.isActiveStart && !calendarDay.isActiveEnd && calendarDay.isActive && (
                    <View style={styles.dayBody}>
                        <View style={[
                            styles.selection,
                            styles.selectionMiddle,
                            {
                                width: cellWidth + 2, // Overlap cell borders
                                backgroundColor: calendarDay.isHighlighted ?
                                    (isPastBookingMiddle ? calendarColors.booking.pastActive : calendarColors.booking.active) :
                                    calendarColors.booking.inactive
                            }
                        ]} />
                    </View>
                )}

                {/* Today indicator */}
                {isToday && <View style={[styles.todayIndicator, { borderColor: calendarColors.cell.text.default }]} />}
            </View>
        )
    }

    const renderMonth = (monthDate: Date) => {
        const year = monthDate.getFullYear()
        const month = monthDate.getMonth()
        const days = getMonthDays(year, month)

        // Split days into weeks
        const weeks: Date[][] = []
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7))
        }

        return (
            <View key={monthDate.toISOString()} style={[
                styles.monthContainer,
                { width: calendarWidth }
            ]}>
                <Text style={[styles.monthHeader, { color: colors.text }]}>
                    {format(monthDate, 'MMMM yyyy')}
                </Text>

                {renderWeekDayNames()}

                <View style={[styles.calendarGrid, { borderColor: calendarColors.cell.border }]}>
                    {weeks.map((week, weekIndex) => (
                        <View key={weekIndex} style={styles.weekRow}>
                            {week.map((date, dayIndex) => renderDay(
                                date,
                                monthDate,
                                weekIndex * 7 + dayIndex,
                                days.length
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        )
    }

    // Group months into rows for responsive layout
    const renderMonthsInRows = () => {
        const monthRows: Date[][] = []

        // For phones, each month gets its own row
        if (numColumns === 1) {
            monthsToShow.forEach(month => {
                monthRows.push([month])
            })
        } else {
            // For tablets, group months by numColumns
            for (let i = 0; i < monthsToShow.length; i += numColumns) {
                monthRows.push(monthsToShow.slice(i, i + numColumns))
            }
        }

        return monthRows.map((monthRow, rowIndex) => (
            <View key={rowIndex} style={[
                styles.monthRow,
                isTablet && { gap: columnGap }
            ]}>
                {monthRow.map(monthDate => renderMonth(monthDate))}
            </View>
        ))
    }

    // Create platform-specific scroll props
    const scrollProps = Platform.OS === 'ios' ? {
        onScroll: handleScroll,
        onScrollEndDrag: handleScrollEndDrag,
        scrollEventThrottle: 16,
    } : {
        onScroll: handleScroll,
        scrollEventThrottle: 16,
        // Android: Add RefreshControl for top loading
        refreshControl: (
            <RefreshControl
                refreshing={isLoadingTop}
                onRefresh={loadPreviousMonths}
                tintColor={colors.tint}
                colors={[colors.tint]}
                progressBackgroundColor={colors.background}
                title="Loading previous month..."
                titleColor={colors.muted}
            />
        )
    }

    return (
        <ScrollView
            ref={scrollViewRef}
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 100
            }}
            bounces={!isOrientationChanging}
            scrollEnabled={!isOrientationChanging}
            {...(!isOrientationChanging ? scrollProps : {})}
        >
            <View style={styles.calendarContainer}>
                {/* Orientation change loading indicator */}
                {isOrientationChanging && (
                    <View style={[styles.orientationLoadingContainer, { backgroundColor: colors.surface }]}>
                        <ActivityIndicator size="large" color={colors.tint} />
                        <Text style={[styles.orientationLoadingText, { color: colors.muted }]}>Adapting to new orientation...</Text>
                    </View>
                )}

                {/* Pull indicator for top (iOS only) */}
                {Platform.OS === 'ios' && pullState.direction === 'top' && !isOrientationChanging && (
                    <View style={[
                        styles.pullIndicator,
                        styles.pullIndicatorTop,
                        { opacity: Math.min(pullState.distance / 60, 1) }
                    ]}>
                        <Text style={[
                            styles.pullText,
                            { color: colors.muted },
                            pullState.isTriggered && { color: colors.tint, fontWeight: '600' }
                        ]}>
                            {pullState.isTriggered ? '↑ Release to load previous month' : '↑ Pull to load previous month'}
                        </Text>
                    </View>
                )}

                {/* Loading indicator for top loading */}
                {isLoadingTop && !isOrientationChanging && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.tint} />
                        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading previous month...</Text>
                    </View>
                )}

                {/* Render calendar content only when not changing orientation */}
                {!isOrientationChanging && renderMonthsInRows()}

                {/* Loading indicator for bottom loading */}
                {isLoadingBottom && !isOrientationChanging && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.tint} />
                        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading next month...</Text>
                    </View>
                )}

                {/* Pull indicator for bottom (iOS only) */}
                {Platform.OS === 'ios' && pullState.direction === 'bottom' && !isOrientationChanging && (
                    <View style={[
                        styles.pullIndicator,
                        styles.pullIndicatorBottom,
                        { opacity: Math.min(pullState.distance / 60, 1) }
                    ]}>
                        <Text style={[
                            styles.pullText,
                            { color: colors.muted },
                            pullState.isTriggered && { color: colors.tint, fontWeight: '600' }
                        ]}>
                            {pullState.isTriggered ? '↓ Release to load next month' : '↓ Pull to load next month'}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: FLOATING_TAB_BAR_COMPENSATION,
    },
    calendarContainer: {
        paddingHorizontal: CALENDAR_PADDING,
        paddingBottom: 20,
        paddingTop: 20,
    },
    // Calendar layout styles
    monthRow: {
        flexDirection: 'row',
        marginBottom: 32,
    },
    monthContainer: {
        flex: 1,
        overflow: 'visible', // Allow events to extend beyond month boundaries
    },
    monthHeader: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 16,
        textAlign: 'center',
    },
    // Week day styles
    weekDayContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    weekDayCell: {
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Calendar grid styles
    calendarGrid: {
        borderTopWidth: 1,
        borderLeftWidth: 1, // Add left border for complete grid
        overflow: 'visible', // Allow events to extend beyond grid boundaries
    },
    weekRow: {
        flexDirection: 'row',
        overflow: 'visible', // Allow events to extend beyond row boundaries
    },
    dayCell: {
        height: CELL_HEIGHT,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        position: 'relative',
        overflow: 'visible', // Allow events to extend beyond cell boundaries
    },
    dayHeader: {
        height: CELL_SIZE_FOR_TEXT,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    todayText: {
        fontWeight: '700',
    },
    todayIndicator: {
        position: 'absolute',
        bottom: 4,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 2,
    },
    // Booking/event styles - absolutely positioned to span across cells
    dayBody: {
        position: 'absolute',
        top: CELL_SIZE_FOR_TEXT + 2, // Offset from day number
        left: 0,
        right: 0,
        bottom: 4,
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'visible', // Allow events to extend beyond cell boundaries
        zIndex: 10, // Ensure events appear above cell borders
    },
    bodyPaddingLeft: {
        paddingLeft: 6,
    },
    bodyPaddingRight: {
        paddingRight: 6,
    },
    bodyMiddle: {
        // Events that span multiple cells - no padding
    },
    selection: {
        position: 'absolute',
        top: 0,
        height: BOOKING_HEIGHT,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 11, // Rounded corners
        overflow: 'visible',
        zIndex: 15, // Higher than dayBody
    },
    selectionStart: {
        left: 4, // Small margin from cell edge
        borderTopLeftRadius: 11,
        borderBottomLeftRadius: 11,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        paddingLeft: 8,
    },
    selectionEnd: {
        left: -1, // Start from left border overlap
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 11,
        borderBottomRightRadius: 11,
        paddingRight: 4,
    },
    selectionMiddle: {
        left: -1, // Overlap cell borders
        right: -1, // Overlap cell borders
        borderRadius: 0, // No rounded corners for middle sections
    },
    selectionText: {
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 12,
        color: '#FFFFFF',
        overflow: 'visible',
    },
    // Loading states
    orientationLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderRadius: 8,
        padding: 20,
    },
    orientationLoadingText: {
        marginTop: 12,
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
    },
    // Pull indicators
    pullIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    pullIndicatorTop: {
        marginBottom: 10,
    },
    pullIndicatorBottom: {
        marginTop: 10,
    },
    pullText: {
        fontSize: 12,
        textAlign: 'center',
    },
}) 