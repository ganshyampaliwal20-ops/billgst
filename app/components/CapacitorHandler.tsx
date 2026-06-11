"use client";

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import toast from 'react-hot-toast';

export default function CapacitorHandler() {
    useEffect(() => {
        const setupListener = async () => {
            try {
                await App.removeAllListeners();
            } catch(e) {}

            try {
                App.addListener('backButton', (event) => {
                    const path = window.location.pathname;
                    
                    if (path === '/' || path === '/dashboard' || path === '/login') {
                        toast('🚪 Exiting App');
                        setTimeout(() => App.exitApp(), 500);
                    } else {
                        toast('🔙 Going back from ' + path);
                        window.history.back();
                    }
                });
            } catch (err) {
                console.error("Capacitor error", err);
            }
        };
        
        setupListener();
        
        return () => {
            try {
                App.removeAllListeners().catch(() => {});
            } catch(e) {}
        }
    }, []);

    return null;
}
