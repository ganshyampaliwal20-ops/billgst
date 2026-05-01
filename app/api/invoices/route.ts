import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkLimit } from "@/lib/subscription";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            console.error('Invoice GET API Error: Unauthorized access attempt');
            return NextResponse.json({ error: 'Please create an account or login to continue' }, { status: 401 });
        }

        const userId = session.user.id;

        const client = await pool.connect();
        try {
            // Fetch invoices for the user
            const result = await client.query(`
          SELECT i.*, 
                 CASE 
                    WHEN c.id IS NOT NULL THEN
                         json_build_object(
                             'name', c.name, 
                             'email', c.email, 
                             'phone', c.phone,
                             'gstin', c.gstin,
                             'address', c.address,
                             'city', c.city,
                             'state', c.state,
                             'pincode', c.pincode
                         )
                    ELSE json_build_object('name', 'Cash Sale', 'phone', null)
                 END as customer,
                 (SELECT json_agg(items) FROM invoice_items items WHERE items.invoice_id = i.id) as items
          FROM invoices i
          LEFT JOIN customers c ON i.customer_id = c.id
          WHERE i.created_by = $1
          ORDER BY i.created_at DESC
        `, [userId]);

            client.release();
            return NextResponse.json(result.rows);
        } catch (dbError: any) {
            client.release();
            console.error('Database Error fetching invoices:', dbError);
            return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Critical Error fetching invoices:', error);
        return NextResponse.json({ error: 'Critical error: ' + error.message }, { status: 500 });
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

    // Check Subscription Limit
    const limitCheck = await checkLimit(userId, 'INVOICE');
    if (!limitCheck.allowed) {
        return NextResponse.json({
            error: limitCheck.reason || 'Subscription limit reached. Please upgrade.'
        }, { status: 403 });
    }

    const client = await pool.connect();
    let data: any = {};
    let customerId: string = '';

    try {
        data = await request.json();
        console.log('Invoice API: Received data:', JSON.stringify(data, null, 2));

        // Check QR Code Limit if QR is being used
        if (data.signed_qrcode) {
            const qrCheck = await checkLimit(userId, 'QR_CODE');
            if (!qrCheck.allowed) {
                return NextResponse.json({
                    error: qrCheck.reason || 'QR Code feature requires Premium Plan.'
                }, { status: 403 });
            }
        }

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

        if (limitCheck.reason === 'USED_FREE_BALANCE') {
            await client.query('UPDATE users SET free_invoices_balance = free_invoices_balance - 1 WHERE id = $1', [userId]);
        }

        const invoiceResult = await client.query(`
        INSERT INTO invoices (
            id, invoice_number, customer_id, invoice_date, due_date, 
            subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, 
            paid_amount, created_by, eway_bill_no, eway_bill_date, transport_mode, distance,
            transporter_name, transporter_id, vehicle_no, irn, ack_no, ack_date, signed_qrcode, type, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW())
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
            userId,
            data.eway_bill_no || null,
            data.eway_bill_date || null,
            data.transport_mode || null,
            data.distance || null,
            data.transporter_name || null,
            data.transporter_id || null,
            data.vehicle_no || null,
            data.irn || null,
            data.ack_no || null,
            data.ack_date || null,
            data.signed_qrcode || null,
            data.type || 'TAX_INVOICE'
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
                    invoice_id, product_id, product_name, hsn_code, quantity, unit_price, gst_rate, total_amount
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    invoiceId,
                    item.product_id,
                    item.product_name,
                    item.hsn_code || null,
                    quantity,
                    unitPrice,
                    gstRate,
                    (quantity * unitPrice) // Item total
                ]);

                // Update product stock safely if it's a PRODUCT
                if (item.type !== 'SERVICE' && item.product_id) {
                    await client.query(`
                        UPDATE products 
                        SET stock_quantity = COALESCE(stock_quantity, 0) - $1 
                        WHERE id = $2
                    `, [quantity, item.product_id]);
                }
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
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'TAX_INVOICE';
                `);
                console.log('Invoice API: Auto-migration successful. Retrying insertion...');

                // Retry Insertion
                await client.query('BEGIN');
                if (limitCheck.reason === 'USED_FREE_BALANCE') {
                    await client.query('UPDATE users SET free_invoices_balance = free_invoices_balance - 1 WHERE id = $1', [userId]);
                }
                const invoiceResult = await client.query(`
                    INSERT INTO invoices (
                        id, invoice_number, customer_id, invoice_date, due_date, 
                        subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, 
                        paid_amount, created_by, eway_bill_no, eway_bill_date, transport_mode, distance,
                        transporter_name, transporter_id, vehicle_no, irn, ack_no, ack_date, signed_qrcode, type, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW())
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
                    userId,
                    data.eway_bill_no || null,
                    data.eway_bill_date || null,
                    data.transport_mode || null,
                    data.distance || null,
                    data.transporter_name || null,
                    data.transporter_id || null,
                    data.vehicle_no || null,
                    data.irn || null,
                    data.ack_no || null,
                    data.ack_date || null,
                    data.signed_qrcode || null,
                    data.type || 'TAX_INVOICE'
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
                            invoice_id, product_id, product_name, hsn_code, quantity, unit_price, gst_rate, total_amount
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        `, [
                            invoiceId,
                            item.product_id,
                            item.product_name,
                            item.hsn_code || null,
                            quantity,
                            unitPrice,
                            gstRate,
                            (quantity * unitPrice) // Item total
                        ]);

                        // Update product stock safely (Retry)
                        if (item.type !== 'SERVICE' && item.product_id) {
                            await client.query(`
                                UPDATE products 
                                SET stock_quantity = COALESCE(stock_quantity, 0) - $1 
                                WHERE id = $2
                            `, [quantity, item.product_id]);
                        }
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
        return NextResponse.json({
            error: `Database Error: ${error instanceof Error ? error.message : 'Unknown Error'}`,
            details: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
        }

        const client = await pool.connect();

        // Build dynamic query
        const sets: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Allowed fields to update
        const allowedFields = ['status', 'paid_amount', 'notes', 'due_date'];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                sets.push(`${key} = $${paramIndex}`);
                values.push(updateData[key]);
                paramIndex++;
            }
        });

        if (sets.length === 0) {
            client.release();
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Add ID and UserID to values for WHERE clause
        values.push(id);
        values.push(userId);

        const query = `
            UPDATE invoices 
            SET ${sets.join(', ')} 
            WHERE id = $${paramIndex} AND created_by = $${paramIndex + 1}
            RETURNING *
        `;

        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Invoice not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Invoice PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get items to restore stock
        const itemsResult = await client.query(`
            SELECT product_id, quantity 
            FROM invoice_items 
            WHERE invoice_id = $1
        `, [id]);

        // 2. Restore stock for each item
        for (const item of itemsResult.rows) {
            if (item.product_id) {
                await client.query(`
                    UPDATE products 
                    SET stock_quantity = COALESCE(stock_quantity, 0) + $1 
                    WHERE id = $2
                `, [item.quantity, item.product_id]);
            }
        }

        // 3. Delete invoice items (Foreign key should handle this if ON DELETE CASCADE, but being explicit is safer)
        await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);

        // 4. Delete invoice payments (removed because table does not exist and fails transaction)

        // 5. Delete the invoice
        const deleteResult = await client.query(`
            DELETE FROM invoices 
            WHERE id = $1 AND created_by = $2
            RETURNING id
        `, [id, userId]);

        if (deleteResult.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return NextResponse.json({ error: 'Invoice not found or unauthorized' }, { status: 404 });
        }

        await client.query('COMMIT');
        client.release();
        return NextResponse.json({ success: true, message: 'Invoice deleted and stock restored' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        client.release();
        console.error('Invoice DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
