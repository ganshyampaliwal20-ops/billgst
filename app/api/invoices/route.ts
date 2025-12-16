import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        // Fetch invoices ONLY for the logged-in user
        const result = await client.query(`
      SELECT i.*, 
             json_build_object('name', c.name, 'email', c.email) as customer,
             (SELECT json_agg(items) FROM invoice_items items WHERE items.invoice_id = i.id) as items
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.created_by = $1
      ORDER BY i.created_at DESC
    `, [session.user.id]);
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    console.log('Invoice API Debug: Session Check', {
        hasSession: !!session,
        userId: session?.user?.id
    });

    if (!session?.user?.id) {
        console.error('Invoice API Error: Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const client = await pool.connect();
    let data: any = {};
    let customerId: string = '';

    try {
        data = await request.json();
        console.log('Invoice API: Received data:', JSON.stringify(data, null, 2));

        // Ensure ID exists
        if (!data.id) {
            data.id = uuidv4();
        }

        // Extract customer ID - handle both object and string formats
        customerId = typeof data.customer === 'object' ? data.customer.id : data.customer;

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
            subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, 
            paid_amount, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING id
    `, [
            data.id,
            data.invoice_number,
            customerId,  // Use extracted customer ID
            data.invoice_date,
            data.due_date || null, // Handle optional due date
            data.subtotal,
            data.total_amount,
            data.igst_amount || 0,
            data.cgst_amount || 0,
            data.sgst_amount || 0,
            data.status,
            data.notes,
            data.paid_amount || 0,
            userId // Add created_by
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
                await client.query(`
                        UPDATE products 
                        SET stock_quantity = COALESCE(stock_quantity, 0) - $1 
                        WHERE id = $2
                    `, [quantity, item.product_id]);
            }
        }
        console.log('Invoice API: All items inserted successfully');

        await client.query('COMMIT');
        client.release();
        console.log('Invoice API: Transaction committed successfully');
        return NextResponse.json({ success: true, id: invoiceId });

    } catch (error: any) {
        // Auto-migration: If column missing error (42703), add columns and retry
        if (error?.code === '42703') {
            console.log('Invoice API: Missing columns detected. Attempting auto-migration...');
            try {
                await client.query('ROLLBACK'); // Rollback failed transaction first

                await client.query(`
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10,2) DEFAULT 0;
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10,2) DEFAULT 0;
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10,2) DEFAULT 0;
                `);
                console.log('Invoice API: Auto-migration successful. Retrying insertion...');

                // Retry Insertion
                await client.query('BEGIN');
                const invoiceResult = await client.query(`
                    INSERT INTO invoices (
                        id, invoice_number, customer_id, invoice_date, due_date, 
                        subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, 
                        paid_amount, created_by, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                    RETURNING id
                `, [
                    data.id,
                    data.invoice_number,
                    customerId,
                    data.invoice_date,
                    data.due_date || null,
                    data.subtotal,
                    data.total_amount,
                    data.igst_amount || 0,
                    data.cgst_amount || 0,
                    data.sgst_amount || 0,
                    data.status,
                    data.notes,
                    data.paid_amount || 0,
                    userId
                ]);

                const invoiceId = invoiceResult.rows[0].id;

                // 2. Insert Items (Retry)
                if (data.items && Array.isArray(data.items)) {
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
                        await client.query(`
                                UPDATE products 
                                SET stock_quantity = COALESCE(stock_quantity, 0) - $1 
                                WHERE id = $2
                            `, [quantity, item.product_id]);
                    }
                }

                await client.query('COMMIT');
                client.release();
                return NextResponse.json({ success: true, id: invoiceId });

            } catch (retryError) {
                console.error('Invoice API: Auto-migration failed:', retryError);
                // Fall through to general error handler
            }
        }

        await client.query('ROLLBACK');
        client.release();
        console.error('Invoice API Transaction Error:', error);
        return NextResponse.json({ error: 'Failed to save invoice', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
