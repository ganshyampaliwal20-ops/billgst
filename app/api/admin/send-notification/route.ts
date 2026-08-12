import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { messaging } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const isSuperAdmin = session?.user?.email === 'billgstapp@gmail.com' || session?.user?.email === 'ganshyampaliwal20@gmail.com';
        
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, body, target } = await req.json();
        
        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        let tokens: string[] = [];

        // Fetch tokens based on target
        if (target === 'all') {
            const result = await pool.query('SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL');
            tokens = result.rows.map(r => r.fcm_token);
        } else if (target) {
            // Target specific email for testing
            const result = await pool.query('SELECT fcm_token FROM users WHERE email = $1 AND fcm_token IS NOT NULL', [target]);
            tokens = result.rows.map(r => r.fcm_token);
        }

        if (tokens.length === 0) {
            return NextResponse.json({ error: 'No users found with registered devices' }, { status: 404 });
        }

        if (!messaging) {
            throw new Error('Firebase messaging is not initialized.');
        }

        const message = {
            notification: { title, body },
            tokens: tokens
        };
        
        const response = await messaging.sendEachForMulticast(message);
        
        return NextResponse.json({ 
            success: true, 
            successCount: response.successCount, 
            failureCount: response.failureCount 
        });

    } catch (error: any) {
        console.error('Admin Send Notification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
