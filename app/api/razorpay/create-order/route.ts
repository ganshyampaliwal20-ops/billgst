import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, planType } = await request.json();

        if (!amount || !planType) {
            return NextResponse.json({ error: 'Amount and planType are required' }, { status: 400 });
        }

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            console.error("Razorpay keys are not configured in environment variables");
            return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
        }

        const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
        
        // Amount should be in paise (e.g. Rs 99 -> 9900)
        const amountInPaise = Math.round(Number(amount) * 100);

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `rcpt_${session.user.id}_${Date.now()}`.substring(0, 40)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Razorpay Order Error:", data);
            return NextResponse.json({ error: data.error?.description || 'Failed to create order' }, { status: response.status });
        }

        return NextResponse.json({
            orderId: data.id,
            amount: data.amount,
            currency: data.currency,
            key: key_id
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
