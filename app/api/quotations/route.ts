import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkLimit } from "@/lib/subscription";

export const dynamic = 'force-dynamic';

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
        console.error('[Quotation POST] Unauthorized: No session');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`[Quotation POST] User ID: ${userId}`);

    // Check Subscription Limit
    const limitCheck = await checkLimit(userId, 'QUOTATION');
    if (!limitCheck.allowed) {
        console.error(`[Quotation POST] Limit Reached: ${limitCheck.reason}`);
        return NextResponse.json({
            error: limitCheck.reason || 'Subscription limit reached. Please upgrade.'
        }, { status: 403 });
    }

    const transactionClient = await pool.connect();

    try {
        const body = await request.json();
        console.log('[Quotation POST] Payload:', JSON.stringify(body));

        // Sanitize Data
        let customerId = body.customer_id;
        if (!customerId || customerId.trim() === '') {
            customerId = null; // Ensure empty string becomes null for UUID
        }

        let quoNumber = body.quotation_number;

        // Retry Loop for Duplicate Quotation Number
        let attempts = 0;
        let savedId = null;

        while (attempts < 3) {
            try {
                attempts++;
                const newId = body.id || uuidv4();

                await transactionClient.query('BEGIN');

                const quotationResult = await transactionClient.query(`
                    INSERT INTO quotations (
                        id, quotation_number, customer_name, customer_id, quotation_date, 
                        total_amount, status, notes, created_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id
                `, [
                    newId,
                    quoNumber,
                    body.customer_name || 'Unknown Customer',
                    customerId,
                    body.quotation_date,
                    Number(body.total_amount) || 0,
                    body.status || 'Pending',
                    body.notes || null,
                    userId
                ]);

                const quotationId = quotationResult.rows[0].id;

                if (body.items && Array.isArray(body.items)) {
                    for (const item of body.items) {
                        await transactionClient.query(`
                            INSERT INTO quotation_items (
                                quotation_id, product_name, quantity, unit_price, total_amount
                            ) VALUES ($1, $2, $3, $4, $5)
                        `, [
                            quotationId,
                            item.product || 'Item',
                            Number(item.quantity) || 0,
                            Number(item.rate) || 0,
                            Number(item.amount) || 0
                        ]);
                    }
                }

                await transactionClient.query('COMMIT');
                savedId = quotationId;
                break; // Success!

            } catch (err: any) {
                await transactionClient.query('ROLLBACK');

                // If Duplicate Key Error (code 23505), modify number and retry
                if (err.code === '23505' && err.constraint?.includes('quotation_number')) {
                    console.warn(`[Quotation POST] Duplicate Number ${quoNumber}. Retrying...`);
                    quoNumber = `${quoNumber}-${Math.floor(Math.random() * 100)}`;
                    continue;
                }

                // If other error, throw it to outer catch
                throw err;
            }
        }

        if (savedId) {
            transactionClient.release();
            return NextResponse.json({ success: true, id: savedId });
        } else {
            throw new Error("Failed to save after 3 attempts");
        }

    } catch (error: any) {
        transactionClient.release();
        console.error('Quotation POST Critical Error:', error);
        return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();

    try {
        const data = await request.json();
        const { id, status, paid_amount } = data;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (status) {
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        if (paid_amount !== undefined) {
            updates.push(`paid_amount = $${paramCount}`);
            values.push(paid_amount);
            paramCount++;
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(id); // ID is the last parameter

        await client.query(`
            UPDATE quotations
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
        `, values);

        client.release();
        return NextResponse.json({ success: true });

    } catch (error) {
        client.release();
        console.error('Quotation PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
    }
}
