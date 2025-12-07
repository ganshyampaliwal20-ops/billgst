import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const client = await pool.connect();

        // Ensure ID exists
        if (!data.id) {
            data.id = crypto.randomUUID();
        }

        // Ensure numeric values are valid
        const price = parseFloat(data.price) || 0;
        const stock = data.stock_quantity || 0;
        const gst = parseFloat(data.gst_rate) || 0;

        const result = await client.query(
            `INSERT INTO products (id, name, description, hsn_code, unit, price, gst_rate, stock_quantity, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING *`,
            [data.id, data.name, data.description, data.hsn_code, data.unit, price, gst, stock]
        );

        client.release();
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
