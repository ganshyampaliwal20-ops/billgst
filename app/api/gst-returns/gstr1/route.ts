import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateGSTR1 } from '@/lib/gstr-generators';
import { validateDateRange } from '@/lib/gstr-validators';

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { period_from, period_to } = await request.json();

        if (!period_from || !period_to) {
            return NextResponse.json(
                { error: 'Missing required fields: period_from, period_to' },
                { status: 400 }
            );
        }

        // Validate date range
        const dateValidation = validateDateRange(new Date(period_from), new Date(period_to));
        if (!dateValidation.valid) {
            return NextResponse.json({ error: dateValidation.error }, { status: 400 });
        }

        const client = await pool.connect();
        const userId = session.user.id;
        const userEmail = session.user.email;

        // Fetch business profile
        const profileResult = await client.query(
            `SELECT business_name, business_gstin, business_address, business_phone
             FROM users WHERE id = $1`,
            [userId]
        );

        let dbRow = profileResult.rows[0];

        // If not found or empty GSTIN, check if user is staff of an owner
        if ((!dbRow || !dbRow.business_gstin) && userEmail) {
            const staffResult = await client.query('SELECT created_by FROM staff WHERE email = $1 LIMIT 1', [userEmail]);
            if (staffResult.rows.length > 0 && staffResult.rows[0].created_by) {
                const ownerId = staffResult.rows[0].created_by;
                const ownerProfileResult = await client.query(
                    `SELECT business_name, business_gstin, business_address, business_phone
                     FROM users WHERE id = $1`,
                    [ownerId]
                );
                if (ownerProfileResult.rows.length > 0) {
                    dbRow = ownerProfileResult.rows[0];
                }
            }
        }

        if (!dbRow) {
            client.release();
            return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
        }

        const businessProfile = {
            name: dbRow.business_name || 'My Business',
            gstin: (dbRow.business_gstin || '').trim(),
            state: '', // Will be extracted from GSTIN if needed
        };

        if (!businessProfile.gstin) {
            client.release();
            return NextResponse.json(
                { error: 'Please configure your GSTIN in Settings before generating GST returns' },
                { status: 400 }
            );
        }

        // Fetch invoices for the period
        const invoicesResult = await client.query(
            `SELECT i.*, 
              json_build_object(
                'name', c.name, 
                'gstin', c.gstin, 
                'state', c.state,
                'address', c.address
              ) as customer,
              (SELECT json_agg(
                json_build_object(
                  'product_name', items.product_name,
                  'hsn_code', items.hsn_code,
                  'quantity', items.quantity,
                  'unit_price', items.unit_price,
                  'gst_rate', items.gst_rate,
                  'total_amount', items.total_amount
                )
              ) FROM invoice_items items WHERE items.invoice_id = i.id) as items
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.created_by = $1 
       AND i.invoice_date >= $2 
       AND i.invoice_date <= $3
       ORDER BY i.invoice_date DESC`,
            [session.user.id, period_from, period_to]
        );

        client.release();

        const invoices = invoicesResult.rows;

        if (invoices.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No invoices found for the selected period',
                data: null
            });
        }

        // Generate GSTR-1
        const gstr1Data = generateGSTR1(
            invoices,
            businessProfile,
            new Date(period_from),
            new Date(period_to)
        );

        return NextResponse.json({
            success: true,
            data: gstr1Data,
            summary: {
                total_invoices: invoices.length,
                b2b_count: gstr1Data.b2b.length,
                b2cl_count: gstr1Data.b2cl.length,
                b2cs_count: gstr1Data.b2cs.length,
                hsn_count: gstr1Data.hsn.length,
            }
        });

    } catch (error: any) {
        console.error('Error generating GSTR-1:', error);
        return NextResponse.json(
            { error: 'Failed to generate GSTR-1', details: error?.message },
            { status: 500 }
        );
    }
}
