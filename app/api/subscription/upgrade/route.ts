
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { addDays, addYears } from 'date-fns';

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planType } = await request.json();

        // Validation
        const validPlans = ['BASIC_30', 'PREMIUM_99', 'YEARLY_999'];
        if (!validPlans.includes(planType)) {
            return NextResponse.json({ error: 'Invalid Plan Type' }, { status: 400 });
        }

        const now = new Date();
        let expiryDate = new Date();

        if (planType === 'YEARLY_999') {
            expiryDate = addYears(now, 1);
        } else {
            expiryDate = addDays(now, 30);
        }

        const client = await pool.connect();

        // Update User Plan
        await client.query(`
            UPDATE users 
            SET plan_type = $1, 
                plan_expiry = $2, 
                subscription_status = 'ACTIVE'
            WHERE id = $3
        `, [planType, expiryDate, session.user.id]);

        client.release();

        return NextResponse.json({ success: true, message: 'Plan updated successfully' });

    } catch (error) {
        console.error('Subscription Update Error:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
}
