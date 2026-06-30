import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const client = await pool.connect();
        const paymentId = uuidv4();

        const result = await client.query(
            `INSERT INTO supplier_payments (id, user_id, supplier_id, purchase_id, amount, payment_date, payment_method, reference_number, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [
                paymentId, 
                session.user.id, 
                data.supplier_id, 
                data.purchase_id || null, 
                data.amount, 
                data.payment_date || new Date().toISOString().split('T')[0], 
                data.payment_method || 'CASH', 
                data.reference_number || null, 
                data.notes || ''
            ]
        );
        
        client.release();
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error recording payment:', error);
        return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 500 });
    }
}
