
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load env vars immediately
dotenv.config({ path: '.env.local' });

async function testInvoiceDirect() {
    try {
        // Dynamic import to ensure env vars are loaded BEFORE db.ts runs
        const { default: pool } = await import('./lib/db.ts');

        console.log('Testing Invoice Creation Direct to DB...');
        const client = await pool.connect();

        // 1. Get User
        const userRes = await client.query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) throw new Error('No users found');
        const userId = userRes.rows[0].id;
        console.log('User ID:', userId);

        // 2. Get Customer
        const custRes = await client.query('SELECT id FROM customers LIMIT 1');
        if (custRes.rows.length === 0) throw new Error('No customers found');
        const customerId = custRes.rows[0].id;
        console.log('Customer ID:', customerId);

        // 3. Create Invoice (Transaction)
        await client.query('BEGIN');

        const invoiceId = randomUUID();
        console.log('Generated Invoice ID:', invoiceId);

        const invoiceResult = await client.query(`
            INSERT INTO invoices (
                id, invoice_number, customer_id, invoice_date, due_date, 
                subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, 
                paid_amount, created_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
            RETURNING id
        `, [
            invoiceId,
            `TEST-DIRECT-${Date.now()}`,
            customerId,
            new Date(),
            new Date(),
            100.00,
            118.00,
            18.00,
            0,
            0,
            'DRAFT',
            'Test via script',
            0,
            userId
        ]);

        console.log('Invoice Inserted:', invoiceResult.rows[0].id);

        await client.query('COMMIT');
        console.log('✅ Transaction Committed. Invoice created successfully.');

        client.release();
        await pool.end();
        process.exit(0);

    } catch (e) {
        console.error('❌ Invoice Test Failed:', e);
        process.exit(1);
    }
}

testInvoiceDirect();
