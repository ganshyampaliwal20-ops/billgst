
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT plan_type, plan_expiry, subscription_status FROM users WHERE id = $1',
                [session.user.id]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const user = result.rows[0];
            return NextResponse.json({
                plan: user.subscription_status === 'PENDING' ? 'FREE' : (user.plan_type || 'FREE'),
                pendingPlan: user.subscription_status === 'PENDING' ? user.plan_type : null,
                expiry: user.plan_expiry,
                status: user.subscription_status || 'ACTIVE'
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Subscription Status Error:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
