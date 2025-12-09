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
        console.log('Invoice API: Received data:', JSON.stringify(data, null, 2));

        // Ensure ID exists
        if (!data.id) {
            data.id = uuidv4();
        }

        // Extract customer ID - handle both object and string formats
        const customerId = typeof data.customer === 'object' ? data.customer.id : data.customer;

        if (!customerId) {
            console.error('Invoice API Error: No customer ID provided');
            throw new Error('Customer ID is required');
        }

        console.log('Invoice API: Extracted customer ID:', customerId);

        // Start Transaction
        await client.query('BEGIN');

        const invoiceResult = await client.query(`
        INSERT INTO invoices (
            id, invoice_number, customer_id, invoice_date, due_date, 
            subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING id
    `, [
            data.id,
            data.invoice_number,
            customerId,  // Use extracted customer ID
            data.invoice_date,
            data.due_date,
            data.subtotal,
            data.total_amount,
            data.igst_amount || 0,
            data.cgst_amount || 0,
            data.sgst_amount || 0,
            data.status,
            data.notes
        ]);

        const invoiceId = invoiceResult.rows[0].id;
        console.log('Invoice API: Invoice created with ID:', invoiceId);

        // 2. Insert Items
        if (data.items && Array.isArray(data.items)) {
            console.log(`Invoice API: Inserting ${data.items.length} items`);

            for (const item of data.items) {
                const quantity = Number(item.quantity);
                const unitPrice = Number(item.unit_price);
                const gstRate = Number(item.gst_rate);

                await client.query(`
                    INSERT INTO invoice_items (
                    invoice_id, product_id, product_name, quantity, unit_price, gst_rate, total_amount
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    invoiceId,
                    item.product_id,
                    item.product_name,
                    quantity,
                    unitPrice,
                    gstRate,
                    (quantity * unitPrice) // Item total
                ]);

                // Update product stock safely
                console.log(`Invoice API: Decrementing stock for product ${item.product_name} by ${quantity}`);
                await client.query(`
                        UPDATE products 
                        SET stock = COALESCE(stock, 0) - $1 
                        WHERE id = $2
                    `, [quantity, item.product_id]);
            }
        }
        console.log('Invoice API: All items inserted successfully');

        await client.query('COMMIT');
        client.release();
        console.log('Invoice API: Transaction committed successfully');
        return NextResponse.json({ success: true, id: invoiceId });

    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        console.error('Invoice API Transaction Error:', error);
        return NextResponse.json({ error: 'Failed to save invoice', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
