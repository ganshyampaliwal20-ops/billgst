import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const client = await pool.connect();
        try {
            const result = await client.query(`
              SELECT i.*, 
                     CASE WHEN c.id IS NOT NULL THEN
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
                     (SELECT json_agg(items) FROM invoice_items items WHERE items.invoice_id = i.id) as items,
                     json_build_object(
                         'business_name', b.business_name,
                         'business_phone', b.business_phone,
                         'business_email', b.business_email,
                         'business_upi_id', b.business_upi_id,
                         'logo', b.logo,
                         'business_address', b.business_address,
                         'gstin', b.gstin
                     ) as business_profile
              FROM invoices i
              LEFT JOIN customers c ON i.customer_id = c.id
              LEFT JOIN business_profiles b ON i.created_by = b.user_id
              WHERE i.id = $1
            `, [id]);
            
            client.release();

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            }
            return NextResponse.json(result.rows[0]);
        } catch (dbError) {
            client.release();
            console.error('DB Error:', dbError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
    } catch (e) {
        console.error('Server error:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
