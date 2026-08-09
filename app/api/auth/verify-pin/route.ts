import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { pin } = body;

        const userId = session.user.id;
        
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT expense_delete_pin FROM users WHERE id = $1', [userId]);
            if (result.rows.length === 0) {
                return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
            }

            const dbPin = result.rows[0].expense_delete_pin;
            
            // If no PIN is set, allow deletion
            if (!dbPin) {
                return NextResponse.json({ success: true });
            }

            // Compare PINs
            if (dbPin === pin) {
                return NextResponse.json({ success: true });
            } else {
                return NextResponse.json({ success: false, error: 'Incorrect PIN' });
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in verify-pin API:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
