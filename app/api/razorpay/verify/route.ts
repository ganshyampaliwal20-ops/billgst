import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from 'crypto';
import pool from '@/lib/db';

export async function POST(request: Request) {
    let client;
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = await request.json();

        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
             return NextResponse.json({ error: 'Missing payment signature details' }, { status: 400 });
        }

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // If valid, update user plan in DB
        client = await pool.connect();
        const userId = session.user.id;
        
        let planExpiry = new Date();
        if (planType === 'YEARLY_299') {
            planExpiry.setFullYear(planExpiry.getFullYear() + 1);
        } else if (planType === 'LIFETIME') {
            planExpiry.setFullYear(planExpiry.getFullYear() + 100);
        } else {
            // Default Monthly (BASIC_30, PREMIUM_99)
            planExpiry.setMonth(planExpiry.getMonth() + 1);
        }

        await client.query(`
            UPDATE users 
            SET plan_type = $1, 
                subscription_status = 'ACTIVE',
                plan_expiry = $2,
                updated_at = NOW()
            WHERE id = $3
        `, [planType, planExpiry.toISOString(), userId]);

        return NextResponse.json({ success: true, message: 'Payment verified and plan activated' });
    } catch (error: any) {
        console.error("Razorpay Verify Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
