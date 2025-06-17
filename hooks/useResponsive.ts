import { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'

interface ResponsiveInfo {
    numColumns: number
    isTablet: boolean
    isLandscape: boolean
    screenWidth: number
    screenHeight: number
}

export function useResponsiveColumns(): ResponsiveInfo {
    const [dimensions, setDimensions] = useState(() => {
        const { width, height } = Dimensions.get('window')
        return { width, height }
    })

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions({ width: window.width, height: window.height })
        })

        return () => subscription?.remove()
    }, [])

    const { width: screenWidth, height: screenHeight } = dimensions
    const isLandscape = screenWidth > screenHeight
    const isTablet = Math.min(screenWidth, screenHeight) >= 768

    // Determine number of columns based on device type and orientation
    let numColumns: number
    if (isTablet && isLandscape) {
        numColumns = 3 // Tablet landscape: 3x2 grid (6 months)
    } else if (isTablet) {
        numColumns = 2 // Tablet portrait: 2x2 grid (4 months)
    } else {
        numColumns = 1 // Phone: 1x3 grid (3 months)
    }

    return {
        numColumns,
        isTablet,
        isLandscape,
        screenWidth,
        screenHeight,
    }
} 