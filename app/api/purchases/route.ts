import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Fetch all purchases
export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const query = `
      SELECT * FROM purchases
      ORDER BY purchase_date DESC, created_at DESC
    `;

        const result = await pool.query(query);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('GET Purchases Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new purchase
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            purchase_number,
            vendor_name,
            vendor_gstin,
            purchase_date,
            items,
            subtotal,
            cgst_amount,
            sgst_amount,
            igst_amount,
            total_amount,
            paid_amount,
            status,
            notes
        } = body;

        const query = `
      INSERT INTO purchases (
        purchase_number, vendor_name, vendor_gstin, purchase_date,
        items, subtotal, cgst_amount, sgst_amount, igst_amount,
        total_amount, paid_amount, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

        const result = await pool.query(query, [
            purchase_number,
            vendor_name,
            vendor_gstin || '',
            purchase_date,
            JSON.stringify(items),
            subtotal,
            cgst_amount || 0,
            sgst_amount || 0,
            igst_amount || 0,
            total_amount,
            paid_amount || 0,
            status || 'UNPAID',
            notes || ''
        ]);

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('POST Purchase Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
