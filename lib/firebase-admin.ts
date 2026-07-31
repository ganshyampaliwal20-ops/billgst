import * as admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
    try {
        let credential;
        
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            // Best practice for Vercel: use individual env vars
            credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines with actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Parse from environment variable
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            credential = admin.credential.cert(serviceAccount);
        } else {
            // Fallback for local development
            const fs = require('fs');
            const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
            if (fs.existsSync(serviceAccountPath)) {
                credential = admin.credential.cert(serviceAccountPath);
            } else {
                console.warn('Firebase Admin: No credentials found. Ensure env vars are set.');
            }
        }

        if (credential) {
            admin.initializeApp({
                credential: credential,
            });
            console.log('Firebase Admin initialized successfully.');
        } else {
            console.warn('Firebase Admin initialization skipped due to missing credentials.');
        }
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
