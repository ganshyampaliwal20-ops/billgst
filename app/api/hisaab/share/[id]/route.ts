import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const client = await pool.connect();
        
        // We only allow IDs that look like userUUID_customerID (contains underscore)
        // This effectively ignores the old insecure IDs
        if (!id.includes('_')) {
            client.release();
            return NextResponse.json({ error: 'Deprecated link format' }, { status: 410 });
        }

        const result = await client.query('SELECT data, user_id FROM hisaab_shares WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const shareData = result.rows[0].data;
        const userId = result.rows[0].user_id;

        let businessProfile = null;
        if (userId) {
            const userResult = await client.query('SELECT business_name, business_phone, business_email, business_upi_id FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length > 0) {
                businessProfile = userResult.rows[0];
            }
        }

        client.release();

        return NextResponse.json({
            ...shareData,
            businessProfile
        });
    } catch (error) {
        console.error('Hisaab Share Fetch Error:', error);
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
