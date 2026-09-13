import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { addDays } from 'date-fns';

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        const client = await pool.connect();

        try {
            // Count total users who have claimed
            const countRes = await client.query("SELECT COUNT(*) as exact_count FROM users WHERE has_claimed_free_plan = true");
            const totalClaimed = parseInt(countRes.rows[0].exact_count, 10);

            let userClaimed = false;
            if (session?.user?.id) {
                let userId = session.user.id;
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(userId) && session.user.email) {
                    const u = await client.query("SELECT id FROM users WHERE email = $1", [session.user.email]);
                    if (u.rows.length > 0) userId = u.rows[0].id;
                }

                if (uuidRegex.test(userId)) {
                    const userRes = await client.query("SELECT has_claimed_free_plan FROM users WHERE id = $1", [userId]);
                    if (userRes.rows.length > 0) {
                        userClaimed = !!userRes.rows[0].has_claimed_free_plan;
                    }
                } else {
                    console.log('Skipping user check because userId is not a valid UUID:', userId);
                }
            }

            return NextResponse.json({
                totalClaimed,
                userClaimed,
                limit: 100,
                remaining: Math.max(0, 100 - totalClaimed)
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Status fetch error:', error);
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        
        try {
            // 1. check again if totalclaimed < 100
            const countRes = await client.query("SELECT COUNT(*) as exact_count FROM users WHERE has_claimed_free_plan = true");
            const totalClaimed = parseInt(countRes.rows[0].exact_count, 10);
            
            if (totalClaimed >= 100) {
                return NextResponse.json({ error: 'Limit reached' }, { status: 400 });
            }

            // Determine the true ID
            let userId = session.user.id;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                if (session.user.email) {
                    const u = await client.query("SELECT id FROM users WHERE email = $1", [session.user.email]);
                    if (u.rows.length > 0) userId = u.rows[0].id;
                }
            }

            if (!uuidRegex.test(userId)) {
                return NextResponse.json({ error: 'Invalid User ID format. Please log out and log in again.' }, { status: 400 });
            }

            // 2. check if user already claimed
            const userRes = await client.query("SELECT has_claimed_free_plan FROM users WHERE id = $1", [userId]);
            if (userRes.rows.length === 0 || userRes.rows[0].has_claimed_free_plan) {
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
            `, [expiryDate, userId]);

            return NextResponse.json({ success: true, message: 'Free plan claimed successfully!' });
        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error('Subscription Claim Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to claim' }, { status: 500 });
    }
}
