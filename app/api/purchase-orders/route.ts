import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Fetch all purchase orders
export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = `
      SELECT po.*, c.name as customer_name, c.phone as customer_phone
      FROM purchase_orders po
      LEFT JOIN customers c ON po.customer_id = c.id
      ORDER BY po.po_date DESC, po.created_at DESC
    `;

        if (status) {
            query = `
        SELECT po.*, c.name as customer_name, c.phone as customer_phone
        FROM purchase_orders po
        LEFT JOIN customers c ON po.customer_id = c.id
        WHERE po.status = $1
        ORDER BY po.po_date DESC, po.created_at DESC
      `;
            const result = await pool.query(query, [status]);
            return NextResponse.json(result.rows);
        }

        const result = await pool.query(query);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('GET Purchase Orders Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new purchase order
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            po_number,
            customer_id,
            po_date,
            delivery_date,
            items,
            subtotal,
            total_amount,
            notes
        } = body;

        const query = `
      INSERT INTO purchase_orders (
        po_number, customer_id, po_date, delivery_date,
        items, subtotal, total_amount, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
      RETURNING *
    `;

        const result = await pool.query(query, [
            po_number,
            customer_id,
            po_date,
            delivery_date || null,
            JSON.stringify(items),
            subtotal,
            total_amount,
            notes || ''
        ]);

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('POST Purchase Order Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update purchase order status
export async function PUT(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        const query = `
      UPDATE purchase_orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

        const result = await pool.query(query, [status, id]);

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('PUT Purchase Order Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
