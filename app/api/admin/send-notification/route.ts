import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { messaging } from '@/lib/firebase-admin';

// Firebase sendEachForMulticast limit = 500 tokens per call
const BATCH_SIZE = 500;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const isSuperAdmin = session?.user?.email === 'billgstapp@gmail.com' || session?.user?.email === 'ganshyampaliwal20@gmail.com';

        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, body, target } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        if (!messaging) {
            throw new Error('Firebase messaging is not initialized.');
        }

        let tokensWithIds: { token: string; userId: string }[] = [];

        // Fetch tokens based on target — include user ID to clean up invalid tokens later
        if (target === 'all') {
            const result = await pool.query(
                'SELECT id, fcm_token FROM users WHERE fcm_token IS NOT NULL AND fcm_token != \'\''
            );
            tokensWithIds = result.rows.map(r => ({ token: r.fcm_token, userId: r.id }));
        } else if (target) {
            // Target specific email for testing
            const result = await pool.query(
                'SELECT id, fcm_token FROM users WHERE email = $1 AND fcm_token IS NOT NULL AND fcm_token != \'\'',
                [target]
            );
            tokensWithIds = result.rows.map(r => ({ token: r.fcm_token, userId: r.id }));
        }

        if (tokensWithIds.length === 0) {
            return NextResponse.json({ error: 'No users found with registered devices' }, { status: 404 });
        }

        let totalSuccess = 0;
        let totalFailure = 0;
        const invalidTokenUserIds: string[] = [];

        // Process in batches of 500 (Firebase hard limit)
        for (let i = 0; i < tokensWithIds.length; i += BATCH_SIZE) {
            const batch = tokensWithIds.slice(i, i + BATCH_SIZE);
            const tokens = batch.map(b => b.token);

            const message = {
                notification: { title, body },
                tokens: tokens,
                android: {
                    priority: 'high' as const,
                    notification: { sound: 'default', channelId: 'billgst_alerts' }
                },
                apns: {
                    payload: { aps: { sound: 'default', badge: 1 } }
                }
            };

            try {
                const response = await messaging.sendEachForMulticast(message);
                totalSuccess += response.successCount;
                totalFailure += response.failureCount;

                // Collect invalid/expired tokens for cleanup
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code || '';
                        // These error codes mean the token is permanently invalid
                        if (
                            errorCode === 'messaging/registration-token-not-registered' ||
                            errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/invalid-argument'
                        ) {
                            invalidTokenUserIds.push(batch[idx].userId);
                        }
                    }
                });
            } catch (batchError) {
                console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, batchError);
                totalFailure += batch.length;
            }
        }

        // Clean up invalid/expired tokens from DB so they don't waste future calls
        if (invalidTokenUserIds.length > 0) {
            try {
                await pool.query(
                    'UPDATE users SET fcm_token = NULL WHERE id = ANY($1::uuid[])',
                    [invalidTokenUserIds]
                );
                console.log(`Cleaned up ${invalidTokenUserIds.length} invalid FCM tokens`);
            } catch (cleanupErr) {
                console.error('Token cleanup error:', cleanupErr);
            }
        }

        return NextResponse.json({
            success: true,
            totalDevices: tokensWithIds.length,
            successCount: totalSuccess,
            failureCount: totalFailure,
            expiredTokensCleaned: invalidTokenUserIds.length
        });

    } catch (error: any) {
        console.error('Admin Send Notification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

