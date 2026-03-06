import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();
        console.log('Reg Debug: Registering', email);

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // Check user count for "First 100 Lifetime Free" logic
        const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(userCountRes.rows[0].count);

        // Logic: First 100 users (0-99) get LIFETIME. 101st (index 100) gets FREE.
        let planType = 'FREE';
        let subStatus = 'ACTIVE'; // Free is active by default

        if (userCount < 100) {
            planType = 'LIFETIME';
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role, plan_type, subscription_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, plan_type',
            [name, email, hashedPassword, 'USER', planType, subStatus]
        );

        return NextResponse.json({
            message: 'User created successfully',
            user: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error details:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
