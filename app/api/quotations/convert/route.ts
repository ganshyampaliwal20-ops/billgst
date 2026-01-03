import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// POST - Convert quotation to invoice
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { quotation_id } = body;

        if (!quotation_id) {
            return NextResponse.json({ error: 'Quotation ID required' }, { status: 400 });
        }

        // Get quotation details
        const quotationResult = await pool.query(
            'SELECT * FROM quotations WHERE id = $1',
            [quotation_id]
        );

        if (quotationResult.rows.length === 0) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        const quotation = quotationResult.rows[0];

        // Check if already converted
        if (quotation.status === 'CONVERTED') {
            return NextResponse.json({ error: 'Quotation already converted' }, { status: 400 });
        }

        // Create invoice from quotation
        const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

        const invoiceQuery = `
      INSERT INTO invoices (
        invoice_number, customer_id, invoice_date,
        subtotal, cgst_amount, sgst_amount, igst_amount, total_amount,
        notes, status, type
      ) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, 'UNPAID', 'TAX_INVOICE')
      RETURNING *
    `;

        const invoiceResult = await pool.query(invoiceQuery, [
            invoiceNumber,
            quotation.customer_id,
            quotation.subtotal,
            quotation.cgst_amount,
            quotation.sgst_amount,
            quotation.igst_amount,
            quotation.total_amount,
            `Converted from Quotation: ${quotation.quotation_number}\n${quotation.notes || ''}`
        ]);

        const newInvoice = invoiceResult.rows[0];

        // Insert invoice items
        const items = quotation.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                await pool.query(
                    `INSERT INTO invoice_items (
            invoice_id, product_id, product_name, hsn_code,
            quantity, unit_price, gst_rate, total_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        newInvoice.id,
                        item.product_id,
                        item.product_name,
                        item.hsn_code || '',
                        item.quantity,
                        item.unit_price,
                        item.gst_rate,
                        (item.quantity * item.unit_price) + ((item.quantity * item.unit_price * item.gst_rate) / 100)
                    ]
                );
            }
        }

        // Update quotation status
        await pool.query(
            'UPDATE quotations SET status = $1, converted_to_invoice_id = $2 WHERE id = $3',
            ['CONVERTED', newInvoice.id, quotation_id]
        );

        return NextResponse.json({
            success: true,
            invoice: newInvoice,
            message: 'Quotation converted to invoice successfully'
        });
    } catch (error: any) {
        console.error('Convert Quotation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
