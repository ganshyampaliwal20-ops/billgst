import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { name, email, password, refCode } = await request.json();
        console.log('Reg Debug: Registering', email, 'Ref:', refCode);

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
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

        // Check referral
        let initialFreeInvoices = 0;
        let referrerId = null;

        if (refCode) {
            const cleanRefCode = refCode.trim().toUpperCase();
            const referrerRes = await pool.query('SELECT user_id FROM referral_codes WHERE UPPER(code) = $1', [cleanRefCode]);
            if (referrerRes.rows.length > 0) {
                referrerId = referrerRes.rows[0].user_id;
                initialFreeInvoices = 20;
            } else {
                console.log('Reg Debug: Ref code not found:', cleanRefCode);
            }
        }

        // Create user
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role, plan_type, subscription_status, free_invoices_balance) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, plan_type',
            [name, email, hashedPassword, 'USER', planType, subStatus, initialFreeInvoices]
        );

        const newUserId = result.rows[0].id;

        // Generate and insert unique referral code for the new user
        const safeName = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || 'USR';
        const newRefCode = safeName + Math.floor(1000 + Math.random() * 9000);
        await pool.query('INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)', [newUserId, newRefCode]);

        // Process referral rewards if applicable
        if (referrerId) {
            // Give referrer 20 invoices
            await pool.query('UPDATE users SET free_invoices_balance = COALESCE(free_invoices_balance, 0) + 20 WHERE id = $1', [referrerId]);
            // Insert reward record
            await pool.query('INSERT INTO referral_rewards (referrer_id, referred_id, reward_amount) VALUES ($1, $2, 20)', [referrerId, newUserId]);
        }

        return NextResponse.json({
            message: 'User created successfully',
            user: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error details:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
