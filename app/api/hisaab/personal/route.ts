import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const client = await pool.connect();

        let data = null;
        try {
            const result = await client.query(`
                SELECT data FROM personal_expenses
                WHERE user_id = $1
            `, [userId]);
            if (result.rows.length > 0) {
                data = typeof result.rows[0].data === 'string' ? JSON.parse(result.rows[0].data) : result.rows[0].data;
            }
        } catch (err: any) {
            if (err?.code !== '42P01') { // Ignore relation does not exist
                throw err;
            }
        } finally {
            client.release();
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Personal Expenses GET Error:', error);
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
            await client.query(`
                INSERT INTO personal_expenses (user_id, data, updated_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (user_id) DO UPDATE 
                SET data = EXCLUDED.data, updated_at = NOW()
            `, [
                userId,
                JSON.stringify(data)
            ]);
        } catch (error: any) {
            if (error?.code === '42P01') { // relation does not exist
                await client.query(`
                    CREATE TABLE IF NOT EXISTS personal_expenses (
                        user_id VARCHAR(255) PRIMARY KEY,
                        data JSONB,
                        updated_at TIMESTAMP DEFAULT NOW()
                    )
                `);
                
                await client.query(`
                    INSERT INTO personal_expenses (user_id, data, updated_at)
                    VALUES ($1, $2, NOW())
                    ON CONFLICT (user_id) DO UPDATE 
                    SET data = EXCLUDED.data, updated_at = NOW()
                `, [
                    userId,
                    JSON.stringify(data)
                ]);
            } else {
                throw error;
            }
        } finally {
            client.release();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Personal Expenses Sync Error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
