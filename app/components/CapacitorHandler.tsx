"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export default function CapacitorHandler() {
    const router = useRouter();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

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
            if (Capacitor.isNativePlatform()) {
                App.removeAllListeners();
            }
        }
    }, [router]); // Router reference doesn't change, but it's good practice

    return null;
}
