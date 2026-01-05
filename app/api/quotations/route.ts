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

        const userId = session.user.id;
        const client = await pool.connect();

        const result = await client.query(`
            SELECT q.*, 
                   (SELECT json_agg(items) FROM quotation_items items WHERE items.quotation_id = q.id) as items
            FROM quotations q
            WHERE q.created_by = $1
            ORDER BY q.created_at DESC
        `, [userId]);

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const client = await pool.connect();

    try {
        const data = await request.json();

        if (!data.id) data.id = uuidv4();

        await client.query('BEGIN');

        const quotationResult = await client.query(`
            INSERT INTO quotations (
                id, quotation_number, customer_name, customer_id, quotation_date, 
                total_amount, status, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `, [
            data.id,
            data.quotation_number,
            data.customer_name,
            data.customer_id || null,
            data.quotation_date,
            data.total_amount,
            data.status || 'Pending',
            data.notes || null,
            userId
        ]);

        const quotationId = quotationResult.rows[0].id;

        if (data.items && Array.isArray(data.items)) {
            for (const item of data.items) {
                await client.query(`
                    INSERT INTO quotation_items (
                        quotation_id, product_name, quantity, unit_price, total_amount
                    ) VALUES ($1, $2, $3, $4, $5)
                `, [
                    quotationId,
                    item.product,
                    Number(item.quantity),
                    Number(item.rate),
                    Number(item.amount)
                ]);
            }
        }

        await client.query('COMMIT');
        client.release();
        return NextResponse.json({ success: true, id: quotationId });

    } catch (error: any) {
        await client.query('ROLLBACK');
        client.release();
        console.error('Quotation POST Error:', error);
        return NextResponse.json({ error: 'Failed to save quotation' }, { status: 500 });
    }
}
