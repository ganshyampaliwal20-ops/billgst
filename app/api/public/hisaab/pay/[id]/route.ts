import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendPushNotification } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const { amt, method } = await request.json();
        if (!amt || !method) return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });

        const client = await pool.connect();
        let targetUserId = null;
        let customerName = 'Customer';
        
        try {
            await client.query('BEGIN');
            const result = await client.query('SELECT data, user_id FROM hisaab_shares WHERE id = $1 OR short_id = $1 FOR UPDATE', [id]);
            
            if (result.rows.length === 0) {
                client.release();
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }

            let shareData = result.rows[0].data;
            if (typeof shareData === 'string') {
                try { shareData = JSON.parse(shareData); } catch(e) {}
            }
            
            targetUserId = result.rows[0].user_id;
            if (shareData.customer && shareData.customer.name) {
                customerName = shareData.customer.name;
            } else if (shareData.name) {
                customerName = shareData.name;
            }

            const newTxn = {
                id: Date.now(),
                amt: Number(amt),
                type: 'credit',
                date: new Date().toISOString(),
                name: method,
                note: `Paid online via ${method}`
            };

            shareData.pending_txns = shareData.pending_txns || [];
            shareData.pending_txns.unshift(newTxn);

            await client.query(`
                UPDATE hisaab_shares 
                SET data = $1, updated_at = NOW() 
                WHERE id = $2 OR short_id = $2
            `, [JSON.stringify(shareData), id]);

            await client.query('COMMIT');
            client.release();

            // Try to send push notification
            if (targetUserId) {
                try {
                    const userRes = await pool.query('SELECT fcm_token FROM users WHERE id = $1', [targetUserId]);
                    const fcmToken = userRes.rows[0]?.fcm_token;
                    if (fcmToken) {
                        await sendPushNotification(
                            fcmToken,
                            `Payment Pending: ₹${amt}`,
                            `${customerName} claims they paid via ${method}. Open app to Accept.`,
                            { route: '/dashboard/expenses' }
                        );
                    }
                } catch(notifyErr) {
                    console.error('Notification Error:', notifyErr);
                }
            }

            return NextResponse.json({ success: true, txn: newTxn });
        } catch(e) {
            await client.query('ROLLBACK');
            client.release();
            throw e;
        }
    } catch (error) {
        console.error('Hisaab Pay Error:', error);
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }
}
