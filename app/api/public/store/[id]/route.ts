import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    let client;
    try {
        const { id } = await params;
        client = await pool.connect();

        // 1. Fetch Business Profile
        const businessResult = await client.query(
            `SELECT business_name, business_logo, business_phone, business_email, business_address, business_upi_id
             FROM users WHERE id = $1`,
            [id]
        );

        if (businessResult.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // 2. Fetch Active Products
        const productsResult = await client.query(
            `SELECT id, name, price, unit, stock_quantity, category, description, image_url 
             FROM products WHERE user_id = $1 ORDER BY name ASC`,
            [id]
        );

        client.release();

        return NextResponse.json({
            business: businessResult.rows[0],
            products: productsResult.rows
        });

    } catch (error) {
        console.error('Public Store API Error:', error);
        if (client) client.release();
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
