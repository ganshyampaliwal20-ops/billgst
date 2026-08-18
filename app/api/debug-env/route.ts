import { NextResponse } from 'next/server';
export async function GET() {
    return NextResponse.json({
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
        NODE_ENV: process.env.NODE_ENV
    });
}
