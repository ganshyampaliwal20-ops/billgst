import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const result = await pool.query(`
            SELECT q.*, c.name as customer_name 
            FROM quotations q 
            LEFT JOIN customers c ON q.customer_id = c.id 
            ORDER BY q.created_at DESC
        `);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Quotations GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { quotation_number, customer_id, quotation_date, valid_until, subtotal, total_amount, items, notes } = body;

        await client.query('BEGIN');

        const quotResult = await client.query(`
            INSERT INTO quotations (quotation_number, customer_id, quotation_date, valid_until, subtotal, total_amount, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
            RETURNING id
        `, [quotation_number, customer_id, quotation_date, valid_until, subtotal, total_amount, notes]);

        const quotationId = quotResult.rows[0].id;

        for (const item of items) {
            await client.query(`
                INSERT INTO quotation_items (quotation_id, product_id, product_name, quantity, unit_price, gst_rate, total_amount)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [quotationId, item.product_id, item.product_name, item.quantity, item.unit_price, item.gst_rate, item.total_amount]);
        }

        await client.query('COMMIT');
        return NextResponse.json({ message: 'Quotation created successfully', id: quotationId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Quotations POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
