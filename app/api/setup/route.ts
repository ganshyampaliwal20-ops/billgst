import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        console.log("Setup API: Started");
        if (!pool) throw new Error("Database pool is not initialized");

        const client = await pool.connect();
        console.log("Setup API: DB Connected");

        // 1. Check/Create User
        const userRes = await client.query('SELECT * FROM users LIMIT 1');
        let userId;

        if (userRes.rows.length === 0) {
            console.log("Setup API: Creating new Admin User");
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newUser = await client.query(`
                INSERT INTO users (name, email, password, role) 
                VALUES ('Admin User', 'admin@example.com', '${hashedPassword}', 'ADMIN') 
                RETURNING id
            `);
            userId = newUser.rows[0].id;
        } else {
            console.log("Setup API: User already exists");
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
        console.error("Setup API Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown Error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
