import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM customers ORDER BY created_at DESC');
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('API: Creating customer:', data);

        const client = await pool.connect();

        // Ensure ID exists
        if (!data.id) {
            data.id = uuidv4();
        }

        const result = await client.query(
            `INSERT INTO customers (id, name, email, phone, gstin, address, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
            [data.id, data.name, data.email, data.phone, data.gstin, data.address]
        );
        console.log('API: Customer Inserted:', result.rows[0]);

        client.release();
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('API Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
