"use client";

import { useEffect } from 'react';
import { App } from '@capacitor/app';

export default function CapacitorHandler() {
    useEffect(() => {
        // Check if running inside Capacitor Native WebView safely
        const isNative = typeof window !== 'undefined' && 
                        (window as any).Capacitor && 
                        (window as any).Capacitor.isNative;

        if (!isNative) return;

        console.log("✅ Capacitor Native Environment Detected. Registering back button.");

        const setupListener = async () => {
            // Remove any existing listeners first to prevent duplicates
            try {
                await App.removeAllListeners();
            } catch(e) {}

            App.addListener('backButton', (event) => {
                const path = window.location.pathname;
                
                // Exclude specific sub-paths from exiting, only exit on exact root paths
                if (path === '/' || path === '/dashboard' || path === '/login') {
                    console.log("🚪 Exiting app from root path");
                    App.exitApp();
                } else {
                    // Force browser history back (Next.js will handle the SPA route change natively via popstate)
                    console.log("🔙 Navigating back from: " + path);
                    window.history.back();
                }
            });
        };
        
        setupListener();
        
        return () => {
            if (isNative) {
                App.removeAllListeners().catch(() => {});
            }
        }
    }, []); // Run only once on mount

    return null;
}
