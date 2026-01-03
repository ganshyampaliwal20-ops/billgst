import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Find user with valid token
            const result = await client.query(
                'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
                [token]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
            }

            const user = result.rows[0];
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update password and clear token
            await client.query(
                'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
                [hashedPassword, user.id]
            );

            return NextResponse.json({ message: 'Password reset successfully' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
