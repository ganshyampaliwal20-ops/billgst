import * as admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
    try {
        const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
        });
        console.log('Firebase Admin initialized successfully.');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

export const messaging = admin.apps.length ? admin.messaging() : null;

export const sendPushNotification = async (token: string, title: string, body: string, data?: any) => {
    if (!messaging) {
        console.error('Firebase messaging is not initialized.');
        return false;
    }
    if (!token) return false;

    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token,
        };
        const response = await messaging.send(message);
        console.log('Successfully sent message:', response);
        return true;
    } catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
};
