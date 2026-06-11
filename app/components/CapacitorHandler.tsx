"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { App } from '@capacitor/app';

export default function CapacitorHandler() {
    const pathname = usePathname();

    useEffect(() => {
        let isAppAvailable = false;
        try {
            // Check if running in Capacitor
            if ((window as any).Capacitor && (window as any).Capacitor.isNative) {
                isAppAvailable = true;
            }
        } catch(e) {}

        if (!isAppAvailable) return;

        const setupListener = async () => {
            await App.removeAllListeners();
            App.addListener('backButton', () => {
                // We override the default back button to ensure SPA routing works
                const path = window.location.pathname;
                const hash = window.location.hash;
                
                // If on root or dashboard base without any modals open
                if ((path === '/' || path === '/dashboard' || path === '/login') && !hash) {
                    App.exitApp();
                } else {
                    // Otherwise, force browser history back (Next.js will handle the SPA route change)
                    window.history.back();
                }
            });
        };
        
        setupListener();
        
        return () => {
            if (isAppAvailable) {
                App.removeAllListeners();
            }
        }
    }, [pathname]); // Re-evaluate if pathname changes just in case, though the listener itself checks window.location dynamically

    return null;
}
