import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const client = await pool.connect();

        const result = await client.query(`
            SELECT * FROM expenses
            WHERE created_by = $1
            ORDER BY expense_date DESC, created_at DESC
        `, [userId]);

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const client = await pool.connect();

    try {
        const data = await request.json();

        const result = await client.query(`
            INSERT INTO expenses (
                category, description, expense_date, amount, payment_method, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [
            data.category,
            data.description,
            data.date,
            data.amount,
            data.paymentMethod,
            userId
        ]);

        client.release();
        return NextResponse.json({ success: true, id: result.rows[0].id });

    } catch (error: any) {
        client.release();
        console.error('Expense POST Error:', error);
        return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
    }
}
