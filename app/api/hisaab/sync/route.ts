import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        if (!data || !data.id) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const customerId = data.id.toString();
        const userId = session.user.id;

        // Create a globally unique ID for this specific user's customer
        // Format: userUUID_customerID
        const globalId = `${userId}_${customerId}`;

        const client = await pool.connect();
        
        // Upsert logic using the globalId
        await client.query(`
            INSERT INTO hisaab_shares (id, user_id, data, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (id) DO UPDATE 
            SET data = EXCLUDED.data, updated_at = NOW(), user_id = EXCLUDED.user_id
        `, [
            globalId,
            userId,
            JSON.stringify(data)
        ]);

        client.release();
        return NextResponse.json({ success: true, id: globalId });
    } catch (error) {
        console.error('Hisaab Sync Error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
