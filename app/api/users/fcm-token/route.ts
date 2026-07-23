import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { token } = await req.json();
        if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

        await pool.query('UPDATE users SET fcm_token = $1 WHERE email = $2', [token, session.user.email]);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('FCM Token error:', error);
        return NextResponse.json({ error: 'Failed to update token' }, { status: 500 });
    }
}
