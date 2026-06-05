import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        
        const { custId } = await req.json();
        if (!custId) return NextResponse.json({error: 'Missing custId'}, {status: 400});

        const globalId = `${session.user.id}_${custId}`;
        const client = await pool.connect();
        
        try {
            let result = await client.query('SELECT short_id FROM hisaab_shares WHERE id = $1', [globalId]);
            if (result.rows.length > 0 && result.rows[0].short_id) {
                return NextResponse.json({ shortId: result.rows[0].short_id });
            }
            
            // Generate a 8 char random short id
            const shortId = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
            
            await client.query(`
                INSERT INTO hisaab_shares (id, user_id, data, updated_at, short_id)
                VALUES ($1, $2, '{}', NOW(), $3)
                ON CONFLICT (id) DO UPDATE SET short_id = COALESCE(hisaab_shares.short_id, EXCLUDED.short_id)
            `, [globalId, session.user.id, shortId]);
            
            // fetch it back in case of conflict resolving to existing
            result = await client.query('SELECT short_id FROM hisaab_shares WHERE id = $1', [globalId]);
            return NextResponse.json({ shortId: result.rows[0].short_id });
        } finally {
            client.release();
        }
    } catch (e) {
        console.error('Hisaab Link Error:', e);
        return NextResponse.json({error: 'Server Error'}, {status: 500});
    }
}
