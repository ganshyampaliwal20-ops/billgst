import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Check if user exists
            const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

            if (userResult.rows.length === 0) {
                // Don't reveal if user exists or not for security, but for now we can just return success
                // In a real app, you might want to send a "Account not found" email or just fake success
                return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
            }

            const user = userResult.rows[0];
            const resetToken = uuidv4();
            // Token valid for 1 hour
            const resetTokenExpiry = new Date(Date.now() + 3600000);

            await client.query(
                'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
                [resetToken, resetTokenExpiry, user.id]
            );

            const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

            const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `;

            const emailSent = await sendEmail(email, 'Password Reset Request', emailHtml);

            if (!emailSent) {
                throw new Error('Failed to send email');
            }

            return NextResponse.json({ message: 'Password reset link sent to your email!' });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Forgot password error details:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
