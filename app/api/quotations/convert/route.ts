import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { quotation_id } = await request.json();
        const userId = session.user.id;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Fetch quotation
            const qResult = await client.query('SELECT * FROM quotations WHERE id = $1 AND created_by = $2', [quotation_id, userId]);
            if (qResult.rows.length === 0) {
                return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
            }
            const q = qResult.rows[0];

            // 2. Generate invoice number
            const invCountRes = await client.query('SELECT COUNT(*) FROM invoices');
            const invNumber = `INV-${new Date().getFullYear()}-${String(Number(invCountRes.rows[0].count) + 1).padStart(4, '0')}`;

            // 3. Create Invoice
            const invoiceId = uuidv4();
            await client.query(`
                INSERT INTO invoices (
                    id, invoice_number, customer_id, invoice_date, due_date,
                    subtotal, cgst_amount, sgst_amount, igst_amount, total_amount,
                    status, notes, created_by, type
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
                invoiceId, invNumber, q.customer_id, new Date(), new Date(),
                q.subtotal, q.cgst_amount, q.sgst_amount, q.igst_amount, q.total_amount,
                'UNPAID', q.notes, userId, 'TAX_INVOICE'
            ]);

            // 4. Create Invoice Items
            const items = q.items;
            if (Array.isArray(items)) {
                for (const item of items) {
                    await client.query(`
                        INSERT INTO invoice_items (
                            invoice_id, product_id, product_name, quantity, unit_price, gst_rate, total_amount
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        invoiceId, item.product_id, item.product_name,
                        item.quantity, item.unit_price, item.gst_rate,
                        (Number(item.quantity) * Number(item.unit_price))
                    ]);
                }
            }

            // 5. Update Quotation Status
            await client.query('UPDATE quotations SET status = $1, converted_to_invoice_id = $2 WHERE id = $3',
                ['CONVERTED', invoiceId, quotation_id]);

            await client.query('COMMIT');
            return NextResponse.json({ success: true, invoice_id: invoiceId });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error in POST /api/quotations/convert:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
