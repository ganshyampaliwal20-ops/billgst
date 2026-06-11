import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * User-Specific API to fetch WhatsApp Status
 */
export async function GET(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        let status = 'STARTING_SERVICE';
        let qr = null;

        // Query the database for the current status
        const result = await pool.query('SELECT status, qr_code FROM whatsapp_bot_status WHERE user_id = $1', [userId]);

        if (result.rows.length > 0) {
            const row = result.rows[0];
            status = row.status || 'STARTING_SERVICE';
            qr = row.qr_code || null;
            
            // If it's a transient state, maybe we update last_updated, but for now just read.
        } else {
            // No status file? Create a START REQUEST for the background service by inserting a row
            await pool.query(
                `INSERT INTO whatsapp_bot_status (user_id, status, last_updated) 
                 VALUES ($1, 'STARTING_SERVICE', CURRENT_TIMESTAMP) 
                 ON CONFLICT (user_id) DO NOTHING`,
                [userId]
            );
            status = 'STARTING_SERVICE';
        }

        return NextResponse.json({
            success: true,
            status,
            qr,
            connected: status === 'CONNECTED' || status === 'READY',
            userId
        });

    } catch (error: any) {
        console.error('Error fetching WhatsApp Status:', error);
        return NextResponse.json({ success: false, error: String(error) + (error.stack ? ' | ' + error.stack : '') }, { status: 500 });
    }
}
