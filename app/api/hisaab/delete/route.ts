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
            await client.query('DELETE FROM hisaab_shares WHERE id = $1 AND user_id = $2', [globalId, session.user.id]);
            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (e) {
        console.error('Hisaab Delete Error:', e);
        return NextResponse.json({error: 'Server Error'}, {status: 500});
    }
}
