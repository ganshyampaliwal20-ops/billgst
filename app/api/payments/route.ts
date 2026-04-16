import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customer_id');

        const client = await pool.connect();
        
        // Auto migrate table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS customer_payments (
                id UUID PRIMARY KEY,
                customer_id UUID,
                amount DECIMAL(10,2),
                payment_mode VARCHAR(50),
                payment_note TEXT,
                payment_date TIMESTAMP DEFAULT NOW(),
                created_by UUID,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        let result;
        if (customerId) {
            result = await client.query('SELECT * FROM customer_payments WHERE created_by = $1 AND customer_id = $2 ORDER BY payment_date DESC, created_at DESC', [session.user.id, customerId]);
        } else {
            result = await client.query('SELECT * FROM customer_payments WHERE created_by = $1 ORDER BY payment_date DESC, created_at DESC', [session.user.id]);
        }

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const data = await request.json();
        const client = await pool.connect();

        await client.query(`
            CREATE TABLE IF NOT EXISTS customer_payments (
                id UUID PRIMARY KEY,
                customer_id UUID,
                amount DECIMAL(10,2),
                payment_mode VARCHAR(50),
                payment_note TEXT,
                payment_date TIMESTAMP DEFAULT NOW(),
                created_by UUID,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        if (!data.id) data.id = uuidv4();

        const result = await client.query(`
            INSERT INTO customer_payments (
                id, customer_id, amount, payment_mode, payment_note, payment_date, created_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW())
            RETURNING *
        `, [
            data.id,
            data.customer_id,
            data.amount,
            data.payment_mode || 'Cash',
            data.payment_note || '',
            userId
        ]);

        client.release();
        return NextResponse.json({ success: true, payment: result.rows[0] });

    } catch (error) {
        console.error('API Error saving payment:', error);
        return NextResponse.json({ error: 'Failed to save payment' }, { status: 500 });
    }
}
