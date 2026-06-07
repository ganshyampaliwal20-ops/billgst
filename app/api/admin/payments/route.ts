import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        
        const superAdmins = ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'];
        if (!session?.user?.email || !superAdmins.includes(session.user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        
        // Auto migrate UTR column if not exists
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_payment_utr VARCHAR(100);
        `);

        // Get all pending users
        const result = await client.query(`
            SELECT id, name, email, phone, plan_type, last_payment_utr, created_at 
            FROM users 
            WHERE subscription_status = 'PENDING'
            ORDER BY created_at DESC
        `);

        client.release();

        return NextResponse.json({ pending: result.rows });
    } catch (error) {
        console.error('Admin Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch pending payments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        
        const superAdmins = ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'];
        if (!session?.user?.email || !superAdmins.includes(session.user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, action } = await request.json();

        if (!userId || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
        }

        const client = await pool.connect();

        if (action === 'APPROVE') {
            await client.query(`
                UPDATE users 
                SET subscription_status = 'ACTIVE'
                WHERE id = $1 AND subscription_status = 'PENDING'
            `, [userId]);
        } else if (action === 'REJECT') {
            await client.query(`
                UPDATE users 
                SET subscription_status = 'REJECTED',
                    plan_type = 'FREE'
                WHERE id = $1 AND subscription_status = 'PENDING'
            `, [userId]);
        }

        client.release();

        return NextResponse.json({ success: true, message: `Payment ${action.toLowerCase()}d successfully` });
    } catch (error) {
        console.error('Admin Action Error:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
