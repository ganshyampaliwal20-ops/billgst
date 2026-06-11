"use client";

import { useEffect } from 'react';
import { App } from '@capacitor/app';

export default function CapacitorHandler() {
    useEffect(() => {
        const setupListener = async () => {
            try {
                await App.removeAllListeners();
            } catch(e) {}

            try {
                App.addListener('backButton', (event) => {
                    const path = window.location.pathname;
                    
                    // Exclude specific sub-paths from exiting, only exit on exact root paths
                    if (path === '/' || path === '/dashboard' || path === '/login') {
                        App.exitApp();
                    } else {
                        // Force browser history back (Next.js will handle the SPA route change natively via popstate)
                        window.history.back();
                    }
                });
            } catch (err) {
                // Ignore errors if not running in a native Capacitor environment
            }
        };
        
        setupListener();
        
        return () => {
            try {
                App.removeAllListeners().catch(() => {});
            } catch(e) {}
        }
    }, []); // Run only once on mount

    return null;
}
