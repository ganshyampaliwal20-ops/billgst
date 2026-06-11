"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function CapacitorHandler() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Pure Web API Hack for Android WebViews (Bypasses missing Capacitor native plugins)
        
        // Ensure there is always a dummy state in the history stack
        // so the native Android WebView consumes the hardware back button
        // instead of exiting the app.
        window.history.pushState({ isBackButtonTarget: true }, '', window.location.href);

        const handlePopState = (event: PopStateEvent) => {
            const currentPath = window.location.pathname;
            
            if (currentPath === '/' || currentPath === '/dashboard' || currentPath === '/login') {
                // We reached the root. Let the next back button exit the app natively.
                // We do NOT push another state here.
            } else {
                // User pressed back on an internal page.
                // Navigate back via Next.js
                router.back();
                
                // Immediately push a new dummy state so the NEXT back button press is also intercepted
                setTimeout(() => {
                    window.history.pushState({ isBackButtonTarget: true }, '', window.location.href);
                }, 100);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [pathname, router]);

    return null;
}
