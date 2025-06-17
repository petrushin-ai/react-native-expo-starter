export interface CalendarReservation {
    id: string
    channel?: string
    guestName?: string
    checkIn?: string
    checkOut?: string
}

export interface MyCalendarItem {
    date: string // YYYY-MM-DD format
    status: 'available' | 'booked' | 'unavailable'
    note?: string
    reservation?: CalendarReservation
}

export interface CalendarEvent {
    type: 'booked' | 'unavailable'
    dates: Date[]
    label: string
}

export interface CalendarEventDay {
    id: string
    type: 'booked' | 'unavailable'
    label: string
    length: number
    eventDayIndex: number
}

export interface CalendarDayType {
    date: Date
    isHighlighted: boolean
    isHighlightedStart: boolean
    isHighlightedEnd: boolean
    isActiveStart: boolean
    isActiveEnd: boolean
    isActive: boolean
    isUnavailable: boolean
    note?: string
    noteSpanLength?: number
} 