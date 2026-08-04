"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function CapacitorHandler() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // We only attempt to register the Capacitor native back button listener
        // if this app is actually running inside the Capacitor Android Webview.
        const setupCapacitor = async () => {
            if (typeof window !== 'undefined' && (window as any).Capacitor) {
                try {
                    const { App } = await import('@capacitor/app');
                    await App.removeAllListeners();
                    
                    App.addListener('backButton', ({ canGoBack }) => {
                        const currentPath = window.location.pathname;
                        // Exit the app if we are on the root pages
                        if (currentPath === '/' || currentPath === '/dashboard' || currentPath === '/login') {
                            App.exitApp();
                        } else {
                            // Otherwise, just go back using the Next.js router
                            router.back();
                        }
                    });
                } catch (e) {
                    console.log("Capacitor App plugin not available.", e);
                }
            }
        };

        setupCapacitor();
        
        // Register Service Worker for Android System Notifications & PWA
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
                console.log('ServiceWorker registration skipped or failed:', err);
            });
        }
    }, [router]);

    return null;
}
