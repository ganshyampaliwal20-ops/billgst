import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const client = await pool.connect();

        let result;
        try {
            result = await client.query(`
                SELECT id, data, user_id FROM hisaab_shares 
                WHERE id = $1 
                OR short_id = $1 
                OR id LIKE $2
                ORDER BY updated_at DESC LIMIT 1
            `, [id, `%_${id}`]);
        } catch (e: any) {
            if (e.code === '42703') { // undefined_column
                result = await client.query(`
                    SELECT id, data, user_id FROM hisaab_shares 
                    WHERE id = $1 
                    OR id LIKE $2
                    ORDER BY updated_at DESC LIMIT 1
                `, [id, `%_${id}`]);
            } else { throw e; }
        }

        if (result.rows.length === 0) {
            const customerId = id.includes('_') ? id.split('_')[1] : id;
            if (customerId && customerId.length > 5) {
                const custResult = await client.query('SELECT * FROM customers WHERE id = $1', [customerId]);
                if (custResult.rows.length > 0) {
                    const customer = custResult.rows[0];
                    const userResult = await client.query('SELECT business_name, business_phone, business_email, business_upi_id FROM users WHERE id = $1', [customer.user_id]);

                    let computedBal = customer.balance || 0;
                    const invResult = await client.query(`SELECT total_amount, paid_amount, type FROM invoices WHERE customer_id = $1`, [customerId]);
                    invResult.rows.forEach(inv => {
                        if (inv.type !== 'QUOTATION' && inv.type !== 'DELIVERY_CHALLAN' && inv.type !== 'PROFORMA' && inv.type !== 'EWAY_BILL') {
                            computedBal += ((parseFloat(inv.total_amount) || 0) - (parseFloat(inv.paid_amount) || 0));
                        }
                    });

                    client.release();
                    return NextResponse.json({
                        ...customer,
                        txns: [],
                        balance: computedBal,
                        businessProfile: userResult.rows[0],
                        _fallback: true
                    }, { headers: { 'Cache-Control': 'no-store' } });
                }
            }
            client.release();
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const globalId = result.rows[0].id;
        const userId = result.rows[0].user_id;
        let shareData = result.rows[0].data;
        if (typeof shareData === 'string') {
            try {
                shareData = JSON.parse(shareData);
            } catch (e) {
                console.error("Failed to parse shareData:", e);
            }
        }

        let businessProfile = null;
        if (userId) {
            const userResult = await client.query('SELECT business_name, business_phone, business_email, business_upi_id FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length > 0) {
                businessProfile = userResult.rows[0];
            }
        }

        // Try to compute live data if we can extract customerId
        let customerId = null;
        if (globalId && globalId.includes('_')) {
            const parts = globalId.split('_');
            customerId = parts[1];
        } else if (shareData && shareData.id) {
            customerId = shareData.id;
        }

        // If the shareData is basically empty (e.g. created by link generation when sync failed), fetch invoice sum
        if (userId && customerId && (!shareData.txns || typeof shareData.balance === 'undefined')) {
            try {
                const custResult = await client.query('SELECT * FROM customers WHERE id = $1', [customerId]);
                if (custResult.rows.length > 0) {
                    const customer = custResult.rows[0];
                    let computedBal = customer.balance || 0;

                    const invResult = await client.query(`SELECT total_amount, paid_amount, type FROM invoices WHERE customer_id = $1`, [customerId]);
                    invResult.rows.forEach(inv => {
                        if (inv.type !== 'QUOTATION' && inv.type !== 'DELIVERY_CHALLAN' && inv.type !== 'PROFORMA' && inv.type !== 'EWAY_BILL') {
                            computedBal += ((parseFloat(inv.total_amount) || 0) - (parseFloat(inv.paid_amount) || 0));
                        }
                    });

                    shareData = { ...customer, txns: [], balance: computedBal, _recovered: true };
                }
            } catch (e) {
                console.error('Failed to compute fallback for empty shareData:', e);
            }
        }

        if (userId && customerId) {
            try {
                // Fetch customer details to ensure they are up to date
                const custResult = await client.query('SELECT * FROM customers WHERE id = $1', [customerId]);
                if (custResult.rows.length > 0) {
                    const customer = custResult.rows[0];
                    shareData = { ...shareData, ...customer }; // Merge to preserve any extra fields
                }


                // No longer overwriting with invoices table.
                // The source of truth for the Hisaab Statement is ALWAYS the hisaab_shares JSON payload.
                // This payload is automatically synced by the Expenses (Hisaab Diary) page and the Invoices dashboard when they share.
                // Reverted this to fix the Hisaab Diary data being wiped out for customers who have both invoices and manual diary entries.

            } catch (e) {
                console.error('Failed to fetch live data for hisaab share:', e);
                // If it fails, fallback to the statically saved shareData
            }
        }

        client.release();

        return NextResponse.json({
            ...shareData,
            businessProfile
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Hisaab Share Fetch Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
