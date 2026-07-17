import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET: Recover all customers for logged-in user from server
export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const client = await pool.connect();

        let rows: any[] = [];
        try {
            const result = await client.query(`
                SELECT data FROM hisaab_shares
                WHERE user_id = $1
                ORDER BY updated_at DESC
            `, [userId]);
            rows = result.rows;
        } finally {
            client.release();
        }

        // Parse and return all customer objects
        const customers = rows
            .map(row => {
                try {
                    return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean);

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Hisaab GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const userId = session.user.id;
        const client = await pool.connect();

        try {
            // Handle bulk sync if data is an array
            const customers = Array.isArray(data) ? data : [data];
            
            await client.query('BEGIN');
            
            for (const cust of customers) {
                if (!cust || !cust.id) continue;
                
                const customerId = cust.id.toString();
                const globalId = `${userId}_${customerId}`;
                const shortId = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 4);
                
                await client.query(`
                    INSERT INTO hisaab_shares (id, user_id, data, updated_at, short_id)
                    VALUES ($1, $2, $3, NOW(), $4)
                    ON CONFLICT (id) DO UPDATE 
                    SET data = EXCLUDED.data, updated_at = NOW(), user_id = EXCLUDED.user_id, short_id = COALESCE(hisaab_shares.short_id, EXCLUDED.short_id)
                `, [
                    globalId,
                    userId,
                    JSON.stringify(cust),
                    shortId
                ]);
            }
            
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        return NextResponse.json({ success: true, count: Array.isArray(data) ? data.length : 1 });
    } catch (error) {
        console.error('Hisaab Sync Error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
