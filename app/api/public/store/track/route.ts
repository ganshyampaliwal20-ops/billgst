import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    let client;
    try {
        const data = await request.json();
        const { businessId, eventType, productId, customerName, customerPhone, message } = data;

        if (!businessId || !eventType) {
            return NextResponse.json({ error: 'Missing businessId or eventType' }, { status: 400 });
        }

        client = await pool.connect();

        if (eventType === 'view') {
            await client.query(
                'INSERT INTO store_views (business_id) VALUES ($1)',
                [businessId]
            );
        } else if (eventType === 'click') {
            if (!productId) {
                client.release();
                return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
            }
            await client.query(
                'INSERT INTO store_clicks (business_id, product_id) VALUES ($1, $2)',
                [businessId, productId]
            );
        } else if (eventType === 'enquiry') {
            await client.query(
                'INSERT INTO store_enquiries (business_id, customer_name, customer_phone, message, product_id) VALUES ($1, $2, $3, $4, $5)',
                [businessId, customerName || '', customerPhone || '', message || '', productId || null]
            );
        }

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Tracking API Error:', error);
        if (client) client.release();
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
