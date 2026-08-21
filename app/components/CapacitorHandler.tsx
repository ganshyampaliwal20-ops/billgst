"use client";

import { useEffect } from 'react';
import { preloadPDFGenerator } from '../../lib/pdf-generator';
import { useRouter, usePathname } from 'next/navigation';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FileOpener } from '@capacitor-community/file-opener';
import { Share } from '@capacitor/share';

export default function CapacitorHandler() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        preloadPDFGenerator();
        // We only attempt to register the Capacitor native back button listener
        // if this app is actually running inside the Capacitor Android Webview.
        const setupCapacitor = async () => {
            if (typeof window !== 'undefined' && (window as any).Capacitor) {
                try {
                    
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

                // Handle Notification Click / Tap to Open File
                try {
                    
                    await LocalNotifications.removeAllListeners();
                    await LocalNotifications.addListener('localNotificationActionPerformed', async (action) => {
                        const extra = action?.notification?.extra;
                        if (extra?.filePath) {
                            try {
                                
                                await FileOpener.open({
                                    filePath: extra.filePath,
                                    contentType: extra.mimeType || 'application/octet-stream',
                                    openWithDefault: true
                                });
                            } catch (openErr) {
                                try {
                                    
                                    await Share.share({
                                        title: extra.fileName || 'Open File',
                                        url: extra.filePath,
                                        dialogTitle: 'Open File'
                                    });
                                } catch (shareErr) {}
                            }
                        }
                    });
                } catch (notifErr) {
                    console.log("LocalNotifications listener setup error:", notifErr);
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
