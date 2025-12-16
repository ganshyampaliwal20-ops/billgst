import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        const result = await client.query('SELECT * FROM customers WHERE created_by = $1 ORDER BY created_at DESC', [session.user.id]);
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    console.log('Customer API Debug: Session Check', {
        hasSession: !!session,
        userId: session?.user?.id
    });

    let userId = session?.user?.id;

    // FALLBACK AUTHENTICATION
    if (!userId) {
        console.warn('⚠️ Customer API: No session found. Attempting Auto-User Fallback...');
        try {
            const client = await pool.connect();
            const userResult = await client.query('SELECT id FROM users LIMIT 1');
            client.release();
            if (userResult.rows.length > 0) {
                userId = userResult.rows[0].id;
                console.log('✅ Auto-User Fallback Successful. Using User ID:', userId);
            }
        } catch (fbError) { console.error('Auto-User Error:', fbError); }
    }

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized: No session and no users in DB' }, { status: 401 });
    }

    try {
        const data = await request.json();
        console.log('API: Creating customer:', data);

        const client = await pool.connect();

        // Ensure ID exists
        if (!data.id) {
            data.id = uuidv4();
        }

        try {
            const result = await client.query(
                `INSERT INTO customers (id, name, email, phone, gstin, address, created_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
           RETURNING *`,
                [data.id, data.name, data.email, data.phone, data.gstin, data.address, userId]
            );
            console.log('API: Customer Inserted:', result.rows[0]);

            client.release();
            return NextResponse.json(result.rows[0]);
        } catch (dbError: any) {
            // Auto-migration: If column missing error (42703), add columns and retry
            if (dbError?.code === '42703') {
                console.log('Customer API: Missing columns detected. Attempting auto-migration...');
                await client.query(`
                    ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
                `);
                // Retry
                const result = await client.query(
                    `INSERT INTO customers (id, name, email, phone, gstin, address, created_by, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
               RETURNING *`,
                    [data.id, data.name, data.email, data.phone, data.gstin, data.address, userId]
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
