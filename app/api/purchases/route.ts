import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const result = await pool.query(`SELECT * FROM purchases ORDER BY created_at DESC`);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Purchases GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { purchase_number, vendor_name, purchase_date, total_amount, notes } = body;

        const result = await pool.query(`
            INSERT INTO purchases (purchase_number, vendor_name, purchase_date, total_amount, status, notes)
            VALUES ($1, $2, $3, $4, 'PAID', $5)
            RETURNING id
        `, [purchase_number, vendor_name, purchase_date, total_amount, notes]);

        return NextResponse.json({ message: 'Purchase recorded successfully', id: result.rows[0].id });
    } catch (error) {
        console.error('Purchases POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
