import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Fetch all credit notes
export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const query = `
      SELECT cn.*, 
        c.name as customer_name,
        i.invoice_number as original_invoice_number
      FROM credit_notes cn
      LEFT JOIN customers c ON cn.customer_id = c.id
      LEFT JOIN invoices i ON cn.original_invoice_id = i.id
      ORDER BY cn.credit_date DESC, cn.created_at DESC
    `;

        const result = await pool.query(query);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('GET Credit Notes Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new credit note
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            credit_note_number,
            original_invoice_id,
            customer_id,
            credit_date,
            items,
            subtotal,
            cgst_amount,
            sgst_amount,
            igst_amount,
            total_amount,
            reason,
            notes
        } = body;

        const query = `
      INSERT INTO credit_notes (
        credit_note_number, original_invoice_id, customer_id, credit_date,
        items, subtotal, cgst_amount, sgst_amount, igst_amount,
        total_amount, reason, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

        const result = await pool.query(query, [
            credit_note_number,
            original_invoice_id,
            customer_id,
            credit_date,
            JSON.stringify(items),
            subtotal,
            cgst_amount || 0,
            sgst_amount || 0,
            igst_amount || 0,
            total_amount,
            reason || '',
            notes || ''
        ]);

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('POST Credit Note Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
