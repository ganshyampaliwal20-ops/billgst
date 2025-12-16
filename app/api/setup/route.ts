import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const client = await pool.connect();

        // 1. Check/Create User
        const userRes = await client.query('SELECT * FROM users LIMIT 1');
        let userId;

        if (userRes.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newUser = await client.query(`
                INSERT INTO users (name, email, password, role) 
                VALUES ('Admin User', 'admin@example.com', '${hashedPassword}', 'ADMIN') 
                RETURNING id
            `);
            userId = newUser.rows[0].id;
        } else {
            userId = userRes.rows[0].id;
        }

        client.release();

        return NextResponse.json({
            success: true,
            message: 'System Setup Completed Successfully',
            user_id: userId,
            info: 'You can now create invoices.'
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown Error'
        }, { status: 500 });
    }
}
