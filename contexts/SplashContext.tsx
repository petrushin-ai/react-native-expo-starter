import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SplashContextType {
    isSplashFinished: boolean;
    setSplashFinished: (finished: boolean) => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function SplashProvider({ children }: { children: ReactNode }) {
    const [isSplashFinished, setIsSplashFinished] = useState(false);

    const setSplashFinished = (finished: boolean) => {
        setIsSplashFinished(finished);
    };

    return (
        <SplashContext.Provider value={{ isSplashFinished, setSplashFinished }}>
            {children}
        </SplashContext.Provider>
    );
}

export function useSplash() {
    const context = useContext(SplashContext);
    if (context === undefined) {
        throw new Error('useSplash must be used within a SplashProvider');
    }
    return context;
} 