import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PWAContextType {
    showInstallPWAButton: boolean;
    handleInstallPWA: () => Promise<void>;
    isInIframe: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAContextProvider = ({ children }: { children: ReactNode }) => {
    const [showInstallPWAButton, setShowInstallPWAButton] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const isInIframe = window.self !== window.top;

    const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallPWAButton(true);
    };

    const handleInstallPWA = async () => {
        if (!deferredPrompt) return;
        const userChoice = await deferredPrompt.prompt();
        if (userChoice.outcome === 'accepted') {
            setShowInstallPWAButton(false);
            setDeferredPrompt(null);
        }
    };

    useEffect(() => {
        if (!isInIframe) {
            setShowInstallPWAButton(false);
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isInIframe]);

    return (
        <PWAContext.Provider value={{ showInstallPWAButton, handleInstallPWA, isInIframe }}>
            {children}
        </PWAContext.Provider>
    );
};

export const usePWAContext = () => {
    const context = useContext(PWAContext);
    if (!context) {
        throw new Error('usePWAContext must be used within a PWAContextProvider');
    }
    return context;
};
