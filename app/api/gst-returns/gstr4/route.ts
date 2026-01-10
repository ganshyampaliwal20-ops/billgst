import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateGSTR4 } from '@/lib/gstr-generators';
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

        // Fetch business profile
        const profileResult = await client.query(
            `SELECT business_name, business_gstin
       FROM users WHERE id = $1`,
            [session.user.id]
        );

        if (profileResult.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
        }

        const businessProfile = {
            name: profileResult.rows[0].business_name || 'My Business',
            gstin: profileResult.rows[0].business_gstin || '',
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
              json_build_object('name', c.name, 'gstin', c.gstin) as customer,
              (SELECT json_agg(items) FROM invoice_items items WHERE items.invoice_id = i.id) as items
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

        // Generate GSTR-4
        const gstr4Data = generateGSTR4(
            invoices,
            businessProfile,
            new Date(period_from),
            new Date(period_to)
        );

        return NextResponse.json({
            success: true,
            data: gstr4Data,
            summary: {
                total_invoices: invoices.length,
                total_turnover: gstr4Data.total_turnover,
                total_tax: gstr4Data.total_tax_paid,
            }
        });

    } catch (error: any) {
        console.error('Error generating GSTR-4:', error);
        return NextResponse.json(
            { error: 'Failed to generate GSTR-4', details: error?.message },
            { status: 500 }
        );
    }
}
