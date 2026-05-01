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

        const userId = session.user.id;
        const client = await pool.connect();

        try {
            // Get user's referral code and balance
            const userRes = await client.query(`
                SELECT u.free_invoices_balance, rc.code 
                FROM users u
                LEFT JOIN referral_codes rc ON u.id = rc.user_id
                WHERE u.id = $1
            `, [userId]);

            // Get total referrals and earned invoices
            const rewardsRes = await client.query(`
                SELECT 
                    COUNT(id) as total_referrals,
                    SUM(reward_amount) as total_earned
                FROM referral_rewards 
                WHERE referrer_id = $1
            `, [userId]);

            // Get list of referred users
            const referralsListRes = await client.query(`
                SELECT 
                    rr.status,
                    rr.created_at as join_date,
                    u.name as referred_name
                FROM referral_rewards rr
                JOIN users u ON rr.referred_id = u.id
                WHERE rr.referrer_id = $1
                ORDER BY rr.created_at DESC
            `, [userId]);

            client.release();

            const userData = userRes.rows[0] || {};
            const rewardsData = rewardsRes.rows[0] || {};

            return NextResponse.json({
                code: userData.code,
                balance: userData.free_invoices_balance || 0,
                totalReferrals: parseInt(rewardsData.total_referrals) || 0,
                totalEarned: parseInt(rewardsData.total_earned) || 0,
                referrals: referralsListRes.rows.map((r: any) => ({
                    name: r.referred_name,
                    date: r.join_date,
                    status: r.status
                }))
            });

        } catch (dbError: any) {
            client.release();
            console.error('Database Error fetching referrals:', dbError);
            return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Critical Error fetching referrals:', error);
        return NextResponse.json({ error: 'Critical error: ' + error.message }, { status: 500 });
    }
}
