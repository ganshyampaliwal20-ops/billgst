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

        let status = 'DISCONNECTED';
        let qr = null;

        // Query the database for the current status
        const result = await pool.query('SELECT status, qr_code, last_updated FROM whatsapp_bot_status WHERE user_id = $1', [userId]);

        if (result.rows.length > 0) {
            const row = result.rows[0];
            status = row.status || 'DISCONNECTED';
            qr = row.qr_code || null;
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
        return NextResponse.json({ success: false, error: error.message || 'Error fetching status' }, { status: 500 });
    }
}

/**
 * Request to start WhatsApp Bot or generate QR Code
 */
export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        await pool.query(
            `INSERT INTO whatsapp_bot_status (user_id, status, qr_code, last_updated) 
             VALUES ($1, 'STARTING_SERVICE', NULL, CURRENT_TIMESTAMP) 
             ON CONFLICT (user_id) DO UPDATE 
             SET status = 'STARTING_SERVICE', qr_code = NULL, last_updated = CURRENT_TIMESTAMP`,
            [userId]
        );

        return NextResponse.json({ success: true, message: 'WhatsApp bot start requested', status: 'STARTING_SERVICE' });
    } catch (error: any) {
        console.error('Error starting WhatsApp bot:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error starting bot' }, { status: 500 });
    }
}

/**
 * Request to disconnect WhatsApp session
 */
export async function DELETE(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        await pool.query(
            `UPDATE whatsapp_bot_status SET status = 'DISCONNECTED', qr_code = NULL, last_updated = CURRENT_TIMESTAMP WHERE user_id = $1`,
            [userId]
        );

        return NextResponse.json({ success: true, message: 'WhatsApp bot disconnected' });
    } catch (error: any) {
        console.error('Error disconnecting WhatsApp bot:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error disconnecting' }, { status: 500 });
    }
}
