'use client';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export default function PushNotificationSetup() {
    useEffect(() => {
        const setupPushNotifications = async () => {
            if (Capacitor.getPlatform() !== 'android' && Capacitor.getPlatform() !== 'ios') {
                return;
            }

            try {
                // Dynamically import to prevent SSR issues
                const { PushNotifications } = await import('@capacitor/push-notifications');

                // 1. Add listeners FIRST so we don't miss the event
                PushNotifications.addListener('registration', async (token) => {
                    console.log('Push registration success, token: ' + token.value);
                    try {
                        await fetch('/api/users/fcm-token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: token.value })
                        });
                    } catch (e) {
                        console.error('Failed to save FCM token:', e);
                    }
                });

                PushNotifications.addListener('registrationError', (error: any) => {
                    console.error('Error on registration: ' + JSON.stringify(error));
                });

                // 2. Then check permissions and register
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    console.log('User denied push notification permissions');
                    return;
                }

                await PushNotifications.register();

            } catch (e) {
                console.error('Failed to setup push notifications:', e);
            }
        };

        setupPushNotifications();
    }, []);

    return null;
}
