import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendPushNotification } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sid, cid, amt, method, utr, customerName, customerPhone, upiId } = body;

        if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) {
            return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }

        const client = await pool.connect();
        let targetUserId = null;
        let cName = customerName || 'Customer';

        try {
            await client.query('BEGIN');

            const newTxn = {
                id: Date.now(),
                amt: Number(amt),
                type: 'credit',
                date: new Date().toISOString(),
                name: method || 'UPI Online',
                note: `Paid ₹${amt} via ${method || 'UPI'}${utr ? ` (Ref/UTR: ${utr})` : ''}`
            };

            // 1. If we have a Hisaab Share ID (sid)
            if (sid) {
                const res = await client.query('SELECT data, user_id FROM hisaab_shares WHERE id = $1 OR short_id = $1 FOR UPDATE', [sid]);
                if (res.rows.length > 0) {
                    targetUserId = res.rows[0].user_id;
                    let shareData = res.rows[0].data;
                    if (typeof shareData === 'string') {
                        try { shareData = JSON.parse(shareData); } catch (e) {}
                    }
                    if (shareData.customer?.name) cName = shareData.customer.name;
                    else if (shareData.name) cName = shareData.name;

                    shareData.pending_txns = shareData.pending_txns || [];
                    shareData.pending_txns.unshift(newTxn);

                    await client.query(`
                        UPDATE hisaab_shares 
                        SET data = $1, updated_at = NOW() 
                        WHERE id = $2 OR short_id = $2
                    `, [JSON.stringify(shareData), sid]);
                }
            }

            // 2. If no targetUserId yet, look up via upiId in users / business_profiles
            if (!targetUserId && upiId) {
                const userQuery = await client.query(`
                    SELECT u.id, u.name 
                    FROM users u
                    LEFT JOIN business_profiles b ON b.user_id = u.id
                    WHERE u.upi_id = $1 OR b.upi_id = $1
                    LIMIT 1
                `, [upiId]);
                if (userQuery.rows.length > 0) {
                    targetUserId = userQuery.rows[0].id;
                }
            }

            await client.query('COMMIT');

            // 3. Send Push Notification to Merchant if target user found
            if (targetUserId) {
                try {
                    const userRes = await pool.query('SELECT fcm_token FROM users WHERE id = $1', [targetUserId]);
                    const fcmToken = userRes.rows[0]?.fcm_token;
                    if (fcmToken) {
                        await sendPushNotification(
                            fcmToken,
                            `💰 Payment Received: ₹${amt}`,
                            `${cName} ne ₹${amt} pay kiye via ${method || 'UPI'}. Hisaab check karein!`,
                            { route: '/dashboard/expenses' }
                        );
                    }
                } catch (notifyErr) {
                    console.error('Push Notification Error:', notifyErr);
                }
            }

            return NextResponse.json({ success: true, txn: newTxn });
        } catch (dbErr) {
            await client.query('ROLLBACK');
            throw dbErr;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Payment Confirmation API Error:', error);
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }
}
