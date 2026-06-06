import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // First ensure all tables exist
        await initDB();

        const client = await pool.connect();

        // 1. Check if user exists
        const checkUser = await client.query('SELECT * FROM users LIMIT 1');
        if (checkUser.rows.length > 0) {
            client.release();
            return NextResponse.json({
                success: true,
                message: 'Account already exists. You are ready to go.',
                user: checkUser.rows[0]
            });
        }

        // 2. Create Default Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const result = await client.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, ['Admin User', 'admin@billgst.in', hashedPassword, 'ADMIN']);

        client.release();

        return NextResponse.json({
            success: true,
            message: 'Default Admin Account Created Successfully!',
            user: result.rows[0],
            note: 'You can now save invoices and products.'
        });

    } catch (error: any) {
        console.error('Fix Account Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
