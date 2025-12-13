import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
        console.log('API: Creating product. Received:', data);

        const client = await pool.connect();

        // Ensure ID exists
        if (!data.id) {
            data.id = uuidv4();
            console.log('API: Generated new UUID:', data.id);
        } else {
            console.log('API: Using provided ID:', data.id);
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

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const client = await pool.connect();

        // Check if product is used in invoices
        const checkUsage = await client.query('SELECT COUNT(*) FROM invoice_items WHERE product_id = $1', [id]);
        if (parseInt(checkUsage.rows[0].count) > 0) {
            client.release();
            return NextResponse.json({ error: 'Cannot delete product: It is used in existing invoices' }, { status: 400 });
        }

        await client.query('DELETE FROM products WHERE id = $1', [id]);
        client.release();

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}