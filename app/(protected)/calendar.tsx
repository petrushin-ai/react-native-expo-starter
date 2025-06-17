import Calendar from '@/components/Calendar'
import CalendarLayout from '@/components/layout/CalendarLayout'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { MyCalendarItem } from '@/types/calendar'
import { addMonths, format, subMonths } from 'date-fns'
import { Stack } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'

// Enhanced mock data generator with proper event merging and spans
const generateMockCalendarData = (startDate: Date, endDate: Date): MyCalendarItem[] => {
    const data: MyCalendarItem[] = []
    const currentDate = new Date(startDate)

    console.log('📅 Starting mock data generation:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    })

    // Initialize all days as available first
    while (currentDate <= endDate) {
        const dateString = format(currentDate, 'yyyy-MM-dd')
        data.push({
            date: dateString,
            status: 'available',
        })
        currentDate.setDate(currentDate.getDate() + 1)
    }

    // Generate booking spans (2-7 days each) with better distribution
    const channels = ['Airbnb', 'Booking.com', 'VRBO', 'Direct']
    const totalDays = data.length
    const targetOccupancyRate = 0.18 // 18% occupancy rate for more realistic calendar
    const numberOfBookings = Math.floor(totalDays * targetOccupancyRate / 4) // Divide by average booking length

    console.log('🏠 Generating bookings:', {
        totalDays,
        targetOccupancyRate: `${Math.round(targetOccupancyRate * 100)}%`,
        numberOfBookings
    })

    // More realistic booking length distribution
    const getBookingLength = () => {
        const random = Math.random()
        if (random < 0.4) return 2 // 40% chance of 2-day bookings
        if (random < 0.7) return 3 // 30% chance of 3-day bookings  
        if (random < 0.85) return 4 // 15% chance of 4-day bookings
        if (random < 0.95) return 5 // 10% chance of 5-day bookings
        return Math.floor(Math.random() * 3) + 6 // 5% chance of 6-8 day bookings
    }

    // Track successful bookings for validation
    let successfulBookings = 0
    let bookingAttempts = 0

    for (let i = 0; i < numberOfBookings; i++) {
        bookingAttempts++
        const bookingLength = getBookingLength()
        const maxStartIndex = Math.max(0, totalDays - bookingLength)
        const randomStartIndex = Math.floor(Math.random() * maxStartIndex)
        const channel = channels[Math.floor(Math.random() * channels.length)]

        // Create a unique reservation ID for this entire booking span
        const reservationId = `res_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`

        // Check if the entire span is available
        let canBook = true
        for (let j = randomStartIndex; j < randomStartIndex + bookingLength && j < totalDays; j++) {
            if (data[j].status !== 'available') {
                canBook = false
                break
            }
        }

        if (canBook) {
            // Create the booking span with same reservation ID for all days
            const checkInDate = data[randomStartIndex].date
            const checkOutDate = data[Math.min(randomStartIndex + bookingLength - 1, totalDays - 1)].date
            const guestName = `Guest ${Math.floor(Math.random() * 900) + 100}` // 3-digit guest number

            // Apply booking to all days in the span
            for (let j = randomStartIndex; j < randomStartIndex + bookingLength && j < totalDays; j++) {
                data[j] = {
                    date: data[j].date,
                    status: 'booked',
                    note: channel,
                    reservation: {
                        id: reservationId, // CRITICAL: Same ID for all days in the booking
                        channel,
                        guestName,
                        checkIn: checkInDate,
                        checkOut: checkOutDate
                    }
                }
            }

            successfulBookings++
            console.log(`📋 Booking ${successfulBookings} created:`, {
                reservationId: reservationId.slice(-8),
                channel,
                dateRange: `${checkInDate} to ${checkOutDate}`,
                length: bookingLength,
                startIndex: randomStartIndex
            })

            // Add a small gap after booking to prevent overlapping (realistic turnover time)
            // Skip the next 1-2 days to simulate cleaning/turnover period
            const turnoverDays = Math.random() < 0.7 ? 1 : 2 // 70% chance of 1-day turnover, 30% chance of 2-day
            for (let k = randomStartIndex + bookingLength; k < randomStartIndex + bookingLength + turnoverDays && k < totalDays; k++) {
                if (data[k].status === 'available') {
                    // Mark as temporarily unavailable for turnover
                    data[k] = {
                        date: data[k].date,
                        status: 'unavailable',
                        note: 'Turnover'
                    }
                }
            }
        }
    }

    // Generate unavailable spans (owner stays, maintenance, etc.) with realistic patterns
    const unavailableReasons = ['Owner Stay', 'Maintenance', 'Blocked', 'Personal Use']
    const targetUnavailableRate = 0.07 // 7% unavailable days
    const numberOfUnavailableSpans = Math.floor(totalDays * targetUnavailableRate / 2.5) // Divide by average span length

    console.log('🚫 Generating unavailable periods:', {
        targetUnavailableRate: `${Math.round(targetUnavailableRate * 100)}%`,
        numberOfUnavailableSpans
    })

    // More realistic unavailable span length distribution
    const getUnavailableLength = () => {
        const random = Math.random()
        if (random < 0.3) return 1 // 30% chance of single day
        if (random < 0.6) return 2 // 30% chance of 2 days
        if (random < 0.8) return 3 // 20% chance of 3 days
        if (random < 0.95) return 4 // 15% chance of 4 days
        return Math.floor(Math.random() * 3) + 5 // 5% chance of 5-7 days
    }

    let successfulUnavailableSpans = 0

    for (let i = 0; i < numberOfUnavailableSpans; i++) {
        const spanLength = getUnavailableLength()
        const maxStartIndex = Math.max(0, totalDays - spanLength)
        const randomStartIndex = Math.floor(Math.random() * maxStartIndex)
        const reason = unavailableReasons[Math.floor(Math.random() * unavailableReasons.length)]

        // Check if the entire span is available
        let canMakeUnavailable = true
        for (let j = randomStartIndex; j < randomStartIndex + spanLength && j < totalDays; j++) {
            if (data[j].status !== 'available') {
                canMakeUnavailable = false
                break
            }
        }

        if (canMakeUnavailable) {
            // Create the unavailable span with consistent note
            for (let j = randomStartIndex; j < randomStartIndex + spanLength && j < totalDays; j++) {
                data[j] = {
                    date: data[j].date,
                    status: 'unavailable',
                    note: reason // CRITICAL: Same note for all days in the span
                }
            }

            successfulUnavailableSpans++
            console.log(`🚫 Unavailable span ${successfulUnavailableSpans} created:`, {
                reason,
                dateRange: `${data[randomStartIndex].date} to ${data[randomStartIndex + spanLength - 1].date}`,
                length: spanLength,
                startIndex: randomStartIndex
            })
        }
    }

    // Final validation and statistics
    const finalStats = {
        totalDays: data.length,
        bookedDays: data.filter(d => d.status === 'booked').length,
        unavailableDays: data.filter(d => d.status === 'unavailable').length,
        availableDays: data.filter(d => d.status === 'available').length,
        successfulBookings,
        bookingAttempts,
        successfulUnavailableSpans,
        uniqueReservationIds: new Set(data.filter(d => d.reservation?.id).map(d => d.reservation!.id)).size
    }

    console.log('📊 Mock data generation completed:', {
        ...finalStats,
        actualOccupancyRate: `${Math.round((finalStats.bookedDays / finalStats.totalDays) * 100)}%`,
        actualUnavailableRate: `${Math.round((finalStats.unavailableDays / finalStats.totalDays) * 100)}%`,
        bookingSuccessRate: `${Math.round((successfulBookings / bookingAttempts) * 100)}%`
    })

    // Validate data consistency
    const reservationSpans = new Map<string, { count: number; dates: string[] }>()
    data.filter(d => d.reservation?.id).forEach(d => {
        const id = d.reservation!.id
        if (!reservationSpans.has(id)) {
            reservationSpans.set(id, { count: 0, dates: [] })
        }
        const span = reservationSpans.get(id)!
        span.count++
        span.dates.push(d.date)
    })

    console.log('🔍 Data consistency validation:', {
        totalReservations: reservationSpans.size,
        averageSpanLength: Array.from(reservationSpans.values()).reduce((sum, span) => sum + span.count, 0) / reservationSpans.size,
        spanLengthDistribution: Array.from(reservationSpans.values()).reduce((dist, span) => {
            const length = span.count
            dist[length] = (dist[length] || 0) + 1
            return dist
        }, {} as Record<number, number>)
    })

    return data
}

export default function CalendarScreen() {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    const [calendarData, setCalendarData] = useState<MyCalendarItem[]>([])
    const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'))
    const [isLoading, setIsLoading] = useState(false)

    // Initialize calendar data - 6 months backward and forward from today
    useEffect(() => {
        const today = new Date()
        const startDate = subMonths(today, 6) // Start 6 months ago
        const endDate = addMonths(today, 6)   // End 6 months from now

        console.log('📅 Generating calendar data:', {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
            today: format(today, 'yyyy-MM-dd')
        })

        const mockData = generateMockCalendarData(startDate, endDate)

        // Log some statistics about the generated data
        const bookedDays = mockData.filter(d => d.status === 'booked').length
        const unavailableDays = mockData.filter(d => d.status === 'unavailable').length
        const availableDays = mockData.filter(d => d.status === 'available').length

        console.log('📊 Calendar data statistics:', {
            totalDays: mockData.length,
            bookedDays,
            unavailableDays,
            availableDays,
            occupancyRate: `${Math.round((bookedDays / mockData.length) * 100)}%`
        })

        setCalendarData(mockData)
    }, [])

    // Mock function for loading additional months (simulating API call)
    const loadAdditionalMonths = useCallback(async (range: { start: Date; end: Date }) => {
        setIsLoading(true)

        console.log('🔄 Loading additional months:', {
            requestedStart: format(range.start, 'yyyy-MM-dd'),
            requestedEnd: format(range.end, 'yyyy-MM-dd')
        })

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        try {
            const additionalData = generateMockCalendarData(range.start, range.end)

            setCalendarData(prevData => {
                // Merge new data with existing data, avoiding duplicates
                const existingDates = new Set(prevData.map(item => item.date))
                const newItems = additionalData.filter(item => !existingDates.has(item.date))

                const mergedData = [...prevData, ...newItems].sort((a, b) => a.date.localeCompare(b.date))

                console.log('📈 Additional data loaded:', {
                    newItemsCount: newItems.length,
                    totalItemsAfterMerge: mergedData.length,
                    dateRangeAfterMerge: {
                        start: mergedData[0]?.date,
                        end: mergedData[mergedData.length - 1]?.date
                    }
                })

                return mergedData
            })
        } catch (error) {
            console.error('❌ Error loading additional months:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleDayPress = useCallback((day: MyCalendarItem) => {
        console.log('Day pressed:', day)
        // Here you could navigate to a detail view or show a modal
    }, [])

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Calendar',
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTintColor: colors.text,
                    headerTitleStyle: {
                        fontWeight: '600',
                        fontSize: 18,
                    },
                    headerShadowVisible: false,
                }}
            />
            <CalendarLayout>
                <Calendar
                    days={calendarData}
                    onDayPress={handleDayPress}
                    selectedMonth={selectedMonth}
                    isLoadingMore={isLoading}
                    loadAdditionalMonths={loadAdditionalMonths}
                />
            </CalendarLayout>
        </>
    )
} 