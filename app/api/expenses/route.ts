import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const result = await pool.query(`SELECT * FROM expenses ORDER BY date DESC`);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Expenses GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { category, description, amount, date } = body;

        const result = await pool.query(`
            INSERT INTO expenses (category, description, amount, date)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [category, description, amount, date]);

        return NextResponse.json({ message: 'Expense added successfully', id: result.rows[0].id });
    } catch (error) {
        console.error('Expenses POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
