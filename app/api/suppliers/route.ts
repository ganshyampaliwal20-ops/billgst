import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '500');

        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        
        // Fetch suppliers with their total purchase amount, paid amount, and due amount
        const result = await client.query(`
            SELECT 
                s.*,
                COALESCE((SELECT SUM(total_amount) FROM purchases p WHERE p.supplier_id = s.id AND p.status != 'CANCELLED'), 0) as total_purchase,
                COALESCE((SELECT SUM(amount) FROM supplier_payments sp WHERE sp.supplier_id = s.id), 0) as total_paid
            FROM suppliers s 
            WHERE s.user_id = $1 
            ORDER BY s.created_at DESC 
            LIMIT $2
        `, [session.user.id, limit]);
        
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const client = await pool.connect();
        const newId = uuidv4();

        const result = await client.query(
            `INSERT INTO suppliers (id, user_id, name, email, phone, gstin, address, city, state, pincode) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [newId, session.user.id, data.name, data.email || null, data.phone || null, data.gstin || null, data.address || null, data.city || null, data.state || null, data.pincode || null]
        );
        
        client.release();
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error creating supplier:', error);
        return NextResponse.json({ error: error.message || 'Failed to create supplier' }, { status: 500 });
    }
}
