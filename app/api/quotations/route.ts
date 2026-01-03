import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const userId = session.user.id;

        const client = await pool.connect();

        let query = `
            SELECT q.*, c.name as customer_name, c.email as customer_email
            FROM quotations q
            JOIN customers c ON q.customer_id = c.id
            WHERE q.created_by = $1
        `;
        const params: any[] = [userId];

        if (status && status !== 'ALL') {
            query += ` AND q.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY q.quotation_date DESC`;

        const result = await client.query(query, params);
        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error in GET /api/quotations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const data = await request.json();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                INSERT INTO quotations (
                    quotation_number, customer_id, quotation_date, valid_until, 
                    items, subtotal, cgst_amount, sgst_amount, igst_amount, 
                    total_amount, status, notes, terms, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING id
            `, [
                data.quotation_number,
                data.customer_id || data.customer?.id,
                data.quotation_date,
                data.valid_until,
                JSON.stringify(data.items),
                data.subtotal,
                data.cgst_amount || 0,
                data.sgst_amount || 0,
                data.igst_amount || 0,
                data.total_amount,
                data.status || 'PENDING',
                data.notes,
                data.terms,
                userId
            ]);

            await client.query('COMMIT');
            return NextResponse.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error in POST /api/quotations:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
