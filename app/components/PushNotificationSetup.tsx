'use client';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

export default function PushNotificationSetup() {
    useEffect(() => {
        const setupPushNotifications = async () => {
            if (Capacitor.getPlatform() !== 'android' && Capacitor.getPlatform() !== 'ios') {
                return;
            }

            try {
                const { PushNotifications } = await import('@capacitor/push-notifications');

                // 1. Add listeners FIRST so we don't miss the event
                PushNotifications.addListener('registration', async (token) => {
                    console.log('Push registration success, token: ' + token.value);
                    try {
                        const res = await fetch('/api/users/fcm-token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: token.value })
                        });
                        if (!res.ok) {
                            toast.error('Failed to save Push Token on Server');
                        }
                    } catch (e) {
                        toast.error('Network Error saving FCM token');
                    }
                });

                PushNotifications.addListener('registrationError', (error: any) => {
                    toast.error('Push Registration Error: ' + JSON.stringify(error));
                });

                // 2. Then check permissions and register
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    toast.error('Push Permission Not Granted');
                    return;
                }

                await PushNotifications.register();

            } catch (e: any) {
                toast.error('Failed to setup push: ' + e.message);
            }
        };

        setupPushNotifications();
    }, []);

    return null;
}
