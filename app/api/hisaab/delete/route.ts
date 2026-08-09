import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function handleDelete(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        let custId: any = null;
        if (req.method === 'GET' || req.method === 'DELETE') {
            const { searchParams } = new URL(req.url);
            custId = searchParams.get('custId') || searchParams.get('id');
        }
        
        if (!custId) {
            try {
                const body = await req.json();
                custId = body.custId || body.id;
            } catch (e) {}
        }

        if (!custId) return NextResponse.json({ error: 'Missing custId' }, { status: 400 });

        const custIdStr = String(custId);
        const globalId = `${session.user.id}_${custIdStr}`;
        const client = await pool.connect();
        
        try {
            const result = await client.query(`
                DELETE FROM hisaab_shares 
                WHERE user_id = $1 
                  AND (id = $2 OR id = $3 OR short_id = $3 OR (data->>'id') = $3)
            `, [session.user.id, globalId, custIdStr]);

            return NextResponse.json({ success: true, deleted: result.rowCount });
        } finally {
            client.release();
        }
    } catch (e) {
        console.error('Hisaab Delete Error:', e);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return handleDelete(req);
}

export async function DELETE(req: Request) {
    return handleDelete(req);
}
