import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            // Rate limiting: max 5 OTPs per email per hour
            const rateCheck = await client.query(
                `SELECT COUNT(*) FROM otp_verifications 
                 WHERE LOWER(email) = LOWER($1) 
                 AND created_at > NOW() - INTERVAL '1 hour'`,
                [email]
            );

            if (parseInt(rateCheck.rows[0].count) >= 5) {
                return NextResponse.json(
                    { error: 'Too many OTP requests. Please wait.' },
                    { status: 429 }
                );
            }

            // Delete previous unverified OTPs for this email
            await client.query(
                `DELETE FROM otp_verifications 
                 WHERE LOWER(email) = LOWER($1) AND verified = false`,
                [email]
            );

            // Generate 6-digit OTP (with leading zeros)
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Insert OTP with 10 min expiry
            await client.query(
                `INSERT INTO otp_verifications (email, otp, expires_at) 
                 VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
                [email.toLowerCase(), otp]
            );

            // Send email
            const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8f9fa; padding: 30px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #1a1a2e; margin: 0;">BillGST - Email Verification</h2>
  </div>
  <div style="background: white; padding: 24px; border-radius: 8px; text-align: center;">
    <p style="color: #333; font-size: 15px;">आपका OTP Code / Your OTP Code:</p>
    <div style="background: #1a1a2e; color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 24px; border-radius: 8px; display: inline-block; margin: 12px 0;">
      ${otp}
    </div>
    <p style="color: #666; font-size: 13px; margin-top: 16px;">यह कोड 10 मिनट में expire हो जाएगा।<br/>This code will expire in 10 minutes.</p>
    <p style="color: #999; font-size: 12px; margin-top: 12px;">अगर आपने यह request नहीं की है, तो इस ईमेल को ignore करें।<br/>If you didn't request this, please ignore this email.</p>
  </div>
  <p style="text-align: center; color: #aaa; font-size: 11px; margin-top: 16px;">© BillGST Team</p>
</div>`;

            const emailSent = await sendEmail(
                email,
                'BillGST - आपका OTP Code',
                emailHtml
            );

            if (!emailSent) {
                return NextResponse.json(
                    { error: 'Failed to send OTP email' },
                    { status: 500 }
                );
            }

            console.log('OTP sent to:', email);
            return NextResponse.json({ success: true, message: 'OTP sent successfully' });

        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
