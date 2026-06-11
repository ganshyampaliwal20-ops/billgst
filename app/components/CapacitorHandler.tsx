"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { App } from '@capacitor/app';

export default function CapacitorHandler() {
    const router = useRouter();

    useEffect(() => {
        let isAppAvailable = false;
        try {
            if ((window as any).Capacitor && (window as any).Capacitor.isNative) {
                isAppAvailable = true;
            }
        } catch(e) {}

        if (!isAppAvailable) return;

        const setupListener = async () => {
            await App.removeAllListeners();
            App.addListener('backButton', (event) => {
                const path = window.location.pathname;
                
                // Exclude specific sub-paths from exiting, only exit on exact root paths
                if (path === '/' || path === '/dashboard' || path === '/login') {
                    App.exitApp();
                } else {
                    // Use Next.js router for smooth client-side back navigation
                    router.back();
                }
            });
        };
        
        setupListener();
        
        return () => {
            if (isAppAvailable) {
                App.removeAllListeners();
            }
        }
    }, [router]); // Router reference doesn't change, but it's good practice

    return null;
}
