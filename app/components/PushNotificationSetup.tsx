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

                PushNotifications.addListener('pushNotificationReceived', (notification) => {
                    // This shows a toast if they receive the notification while the app is open
                    toast.success(`${notification.title}\n${notification.body}`, { 
                        duration: 6000, 
                        icon: '📢' 
                    });
                });

                PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                    // You can add routing logic here if you want to send them to a specific page
                    console.log('Push action performed: ' + JSON.stringify(notification));
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
