import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { addDays } from 'date-fns';

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        const client = await pool.connect();

        // Count total users who have claimed
        const countRes = await client.query("SELECT COUNT(*) as exact_count FROM users WHERE has_claimed_free_plan = true");
        const totalClaimed = parseInt(countRes.rows[0].exact_count, 10);

        let userClaimed = false;
        if (session?.user?.id) {
            const userRes = await client.query("SELECT has_claimed_free_plan FROM users WHERE id = $1", [session.user.id]);
            if (userRes.rows.length > 0) {
                userClaimed = !!userRes.rows[0].has_claimed_free_plan;
            }
        }

        client.release();

        return NextResponse.json({
            totalClaimed,
            userClaimed,
            limit: 100,
            remaining: Math.max(0, 100 - totalClaimed)
        });
    } catch (error) {
        console.error('Status fetch error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        
        // 1. check again if totalclaimed < 100
        const countRes = await client.query("SELECT COUNT(*) as exact_count FROM users WHERE has_claimed_free_plan = true");
        const totalClaimed = parseInt(countRes.rows[0].exact_count, 10);
        
        if (totalClaimed >= 100) {
            client.release();
            return NextResponse.json({ error: 'Limit reached' }, { status: 400 });
        }

        // 2. check if user already claimed
        const userRes = await client.query("SELECT has_claimed_free_plan FROM users WHERE id = $1", [session.user.id]);
        if (userRes.rows.length === 0 || userRes.rows[0].has_claimed_free_plan) {
            client.release();
            return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
        }

        const now = new Date();
        const expiryDate = addDays(now, 30);

        // 3. update user
        await client.query(`
            UPDATE users 
            SET has_claimed_free_plan = true, 
                plan_type = 'PREMIUM_99', 
                plan_expiry = $1, 
                subscription_status = 'ACTIVE'
            WHERE id = $2
        `, [expiryDate, session.user.id]);

        client.release();

        return NextResponse.json({ success: true, message: 'Free plan claimed successfully!' });

    } catch (error) {
        console.error('Subscription Claim Error:', error);
        return NextResponse.json({ error: 'Failed to claim' }, { status: 500 });
    }
}
