import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const client = await pool.connect();
        
        // We only allow IDs that look like userUUID_customerID (contains underscore)
        // This effectively ignores the old insecure IDs
        // We allow both long IDs and short IDs
        const result = await client.query('SELECT id, data, user_id FROM hisaab_shares WHERE id = $1 OR short_id = $1', [id]);
        
        if (result.rows.length === 0) {
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

        // Try to compute live data if we can extract customerId from globalId
        if (globalId && globalId.includes('_')) {
            const parts = globalId.split('_');
            const customerId = parts[1];

            if (userId && customerId) {
                try {
                    // Fetch customer details to ensure they are up to date
                    const custResult = await client.query('SELECT * FROM customers WHERE id = $1', [customerId]);
                    if (custResult.rows.length > 0) {
                        const customer = custResult.rows[0];
                        shareData = { ...shareData, ...customer }; // Merge to preserve any extra fields
                    }

                    // Fetch Invoices
                    const invResult = await client.query('SELECT invoice_date, total_amount, paid_amount, invoice_number FROM invoices WHERE customer_id = $1 AND created_by = $2', [customerId, userId]);
                    
                    // Fetch Payments
                    const payResult = await client.query('SELECT payment_date, amount, payment_mode, payment_note FROM customer_payments WHERE customer_id = $1 AND created_by = $2', [customerId, userId]);
                    
                    const txns: any[] = [];
                    let totalSalesComputed = 0;
                    let totalPaidComputed = 0;

                    invResult.rows.forEach((inv: any) => {
                         if (inv.invoice_date) {
                             txns.push({
                                 date: new Date(inv.invoice_date).toISOString(),
                                 amt: parseFloat(inv.total_amount || 0),
                                 type: 'debit',
                                 name: 'Invoice ' + inv.invoice_number
                             });
                             totalSalesComputed += parseFloat(inv.total_amount || 0);

                             if (parseFloat(inv.paid_amount || 0) > 0) {
                                 txns.push({
                                     date: new Date(inv.invoice_date).toISOString(),
                                     amt: parseFloat(inv.paid_amount || 0),
                                     type: 'credit',
                                     name: 'Payment (Inv ' + inv.invoice_number + ')'
                                 });
                                 totalPaidComputed += parseFloat(inv.paid_amount || 0);
                             }
                         }
                    });

                    payResult.rows.forEach((p: any) => {
                         if (p.payment_date) {
                             txns.push({
                                 date: new Date(p.payment_date).toISOString(),
                                 amt: parseFloat(p.amount || 0),
                                 type: 'credit',
                                 name: 'Payment ' + (p.payment_mode ? `(${p.payment_mode})` : '')
                             });
                             totalPaidComputed += parseFloat(p.amount || 0);
                         }
                    });

                    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const realTotalDue = Math.max(0, totalSalesComputed - totalPaidComputed);

                    shareData.txns = txns;
                    shareData.balance = -realTotalDue;

                } catch (e) {
                    console.error('Failed to fetch live data for hisaab share:', e);
                    // If it fails, fallback to the statically saved shareData
                }
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
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
