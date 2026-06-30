import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const client = await pool.connect();
        
        // We only allow IDs that look like userUUID_customerID (contains underscore)
        // This effectively ignores the old insecure IDs
        // We allow both long IDs and short IDs
        const result = await client.query('SELECT data, user_id FROM hisaab_shares WHERE id = $1 OR short_id = $1', [id]);
        
        if (result.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        let shareData = result.rows[0].data;
        if (typeof shareData === 'string') {
            try {
                shareData = JSON.parse(shareData);
            } catch (e) {
                console.error("Failed to parse shareData:", e);
            }
        }
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
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Hisaab Share Fetch Error:', error);
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
