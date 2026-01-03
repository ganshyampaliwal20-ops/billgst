import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Fetch all quotations
export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = `
      SELECT q.*, c.name as customer_name, c.phone as customer_phone
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      ORDER BY q.quotation_date DESC, q.created_at DESC
    `;

        if (status) {
            query = `
        SELECT q.*, c.name as customer_name, c.phone as customer_phone
        FROM quotations q
        LEFT JOIN customers c ON q.customer_id = c.id  
        WHERE q.status = $1
        ORDER BY q.quotation_date DESC, q.created_at DESC
      `;
            const result = await pool.query(query, [status]);
            return NextResponse.json(result.rows);
        }

        const result = await pool.query(query);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('GET Quotations Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new quotation
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            quotation_number,
            customer_id,
            quotation_date,
            valid_until,
            items,
            subtotal,
            cgst_amount,
            sgst_amount,
            igst_amount,
            total_amount,
            notes,
            terms
        } = body;

        const query = `
      INSERT INTO quotations (
        quotation_number, customer_id, quotation_date, valid_until,
        items, subtotal, cgst_amount, sgst_amount, igst_amount, total_amount,
        notes, terms, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING')
      RETURNING *
    `;

        const result = await pool.query(query, [
            quotation_number,
            customer_id,
            quotation_date,
            valid_until,
            JSON.stringify(items),
            subtotal,
            cgst_amount || 0,
            sgst_amount || 0,
            igst_amount || 0,
            total_amount,
            notes || '',
            terms || ''
        ]);

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('POST Quotation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update quotation status or convert to invoice
export async function PUT(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, converted_to_invoice_id } = body;

        const query = `
      UPDATE quotations
      SET status = $1, converted_to_invoice_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

        const result = await pool.query(query, [
            status,
            converted_to_invoice_id || null,
            id
        ]);

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('PUT Quotation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
