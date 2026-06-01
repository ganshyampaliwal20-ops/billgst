import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '500');
        const offset = (page - 1) * limit;

        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Please create an account or login to continue' }, { status: 401 });
        }

        const client = await pool.connect();
        const result = await client.query('SELECT * FROM customers WHERE created_by = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [session.user.id, limit, offset]);
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Please create an account or login to continue' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const data = await request.json();
        const client = await pool.connect();

        if (!data.id) {
            data.id = uuidv4();
        }

        try {
            const result = await client.query(
                `INSERT INTO customers (id, name, email, phone, gstin, address, promise_date, created_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
           RETURNING *`,
                [data.id, data.name, data.email || null, data.phone || null, data.gstin || null, data.address || null, data.promise_date || null, userId]
            );
            client.release();
            return NextResponse.json(result.rows[0]);
        } catch (dbError: any) {
            if (dbError?.code === '42703' || dbError?.code === '42P18') {
                await client.query(`
                    ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
                    ALTER TABLE customers ADD COLUMN IF NOT EXISTS promise_date DATE;
                `);
                const result = await client.query(
                    `INSERT INTO customers (id, name, email, phone, gstin, address, promise_date, created_by, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
               RETURNING *`,
                    [data.id, data.name, data.email || null, data.phone || null, data.gstin || null, data.address || null, data.promise_date || null, userId]
                );
                client.release();
                return NextResponse.json(result.rows[0]);
            }
            throw dbError;
        }

    } catch (error) {
        console.error('API Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const client = await pool.connect();

        try {
            const result = await client.query(
                `UPDATE customers 
                 SET name = $1, email = $2, phone = $3, gstin = $4, address = $5, promise_date = $6
                 WHERE id = $7 AND created_by = $8
                 RETURNING *`,
                [data.name, data.email || null, data.phone || null, data.gstin || null, data.address || null, data.promise_date || null, data.id, session.user.id]
            );
            client.release();
            return NextResponse.json({ success: true, data: result.rows[0] });
        } catch (dbError: any) {
            if (dbError?.code === '42703') {
                await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS promise_date DATE;`);
                const result = await client.query(
                    `UPDATE customers 
                     SET name = $1, email = $2, phone = $3, gstin = $4, address = $5, promise_date = $6
                     WHERE id = $7 AND created_by = $8
                     RETURNING *`,
                    [data.name, data.email || null, data.phone || null, data.gstin || null, data.address || null, data.promise_date || null, data.id, session.user.id]
                );
                client.release();
                return NextResponse.json({ success: true, data: result.rows[0] });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('API Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('DELETE FROM customers WHERE id = $1 AND created_by = $2', [id, session.user.id]);
            client.release();
            return NextResponse.json({ success: true });
        } catch (dbError: any) {
            client.release();
            // Code 23503 is foreign key violation (e.g. if invoices exist for this customer)
            if (dbError.code === '23503') {
                return NextResponse.json({ error: 'Cannot delete customer because they have existing invoices. Please delete their invoices first.' }, { status: 400 });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('API Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
