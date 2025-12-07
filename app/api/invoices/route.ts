import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const client = await pool.connect();
        // Fetch invoices with customer details
        const result = await client.query(`
      SELECT i.*, 
             json_build_object('name', c.name, 'email', c.email) as customer,
             (SELECT json_agg(items) FROM invoice_items items WHERE items.invoice_id = i.id) as items
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `);
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        const data = await request.json();

        // Ensure ID exists
        if (!data.id) {
            data.id = uuidv4();
        }

        // Start Transaction
        await client.query('BEGIN');

        const invoiceResult = await client.query(`
        INSERT INTO invoices (
            id, invoice_number, customer_id, invoice_date, due_date, 
            subtotal, total_amount, igst_amount, status, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING id
    `, [
            data.id,
            data.invoice_number,
            data.customer.id,
            data.invoice_date,
            data.due_date,
            data.subtotal,
            data.total_amount,
            data.total_tax || 0, // Handle missing tax field mapping
            data.status,
            data.notes
        ]);

        const invoiceId = invoiceResult.rows[0].id;

        // 2. Insert Items
        if (data.items && Array.isArray(data.items)) {
            for (const item of data.items) {
                await client.query(`
                INSERT INTO invoice_items (
                invoice_id, product_id, product_name, quantity, unit_price, gst_rate, total_amount
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                    invoiceId,
                    item.product_id,
                    item.product_name,
                    item.quantity,
                    item.unit_price,
                    item.gst_rate,
                    (item.quantity * item.unit_price) // Item total
                ]);
            }
        }

        await client.query('COMMIT');
        client.release();
        return NextResponse.json({ success: true, id: invoiceId });

    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        console.error('Transaction Error:', error);
        return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
    }
}
