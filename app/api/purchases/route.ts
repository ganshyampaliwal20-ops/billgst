import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        
        const result = await client.query(`
            SELECT p.*, s.name as supplier_name 
            FROM purchases p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.user_id = $1 
            ORDER BY p.created_at DESC 
            LIMIT $2 OFFSET $3
        `, [session.user.id, limit, offset]);
        
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
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
        const purchaseId = uuidv4();

        try {
            await client.query('BEGIN');

            // 1. Create Purchase
            await client.query(
                `INSERT INTO purchases (id, user_id, supplier_id, bill_number, bill_date, sub_total, cgst_total, sgst_total, igst_total, discount_amount, total_amount, notes) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    purchaseId, 
                    session.user.id, 
                    data.supplier_id || null, 
                    data.bill_number || `PB-${Date.now()}`, 
                    data.bill_date || new Date().toISOString().split('T')[0],
                    data.sub_total || 0,
                    data.cgst_total || 0,
                    data.sgst_total || 0,
                    data.igst_total || 0,
                    data.discount_amount || 0,
                    data.total_amount || 0,
                    data.notes || ''
                ]
            );

            // 2. Insert Items & Update Stock
            if (data.items && Array.isArray(data.items)) {
                for (const item of data.items) {
                    let currentProductId = item.product_id;
                    const qty = parseFloat(item.quantity) || 0;
                    const totalGstRate = (parseFloat(item.cgst_rate) || 0) + (parseFloat(item.sgst_rate) || 0) + (parseFloat(item.igst_rate) || 0);

                    if (!currentProductId && item.product_name) {
                        // Create new product if not linked
                        currentProductId = uuidv4();
                        await client.query(
                            `INSERT INTO products (id, name, purchase_price, price, gst_rate, stock_quantity, created_by, type, unit, created_at)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, 'PRODUCT', 'PCS', NOW())`,
                            [currentProductId, item.product_name, item.price, item.price, totalGstRate, qty, session.user.id]
                        );
                    } else if (currentProductId) {
                        // Update existing product stock
                        await client.query(
                            `UPDATE products 
                             SET stock_quantity = COALESCE(stock_quantity, 0) + $1,
                                 purchase_price = $4
                             WHERE id = $2 AND created_by = $3`,
                            [qty, currentProductId, session.user.id, item.price]
                        );
                    }

                    const itemId = uuidv4();
                    
                    await client.query(
                        `INSERT INTO purchase_items (id, purchase_id, product_id, product_name, hsn_code, quantity, price, cgst_rate, sgst_rate, igst_rate, total)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                        [
                            itemId, 
                            purchaseId, 
                            currentProductId || null, 
                            item.product_name, 
                            item.hsn_code || '', 
                            qty, 
                            item.price, 
                            item.cgst_rate || 0, 
                            item.sgst_rate || 0, 
                            item.igst_rate || 0, 
                            item.total
                        ]
                    );
                }
            }

            await client.query('COMMIT');
            client.release();
            
            return NextResponse.json({ success: true, id: purchaseId });
        } catch (txError: any) {
            await client.query('ROLLBACK');
            client.release();
            throw txError;
        }
    } catch (error: any) {
        console.error('Error creating purchase:', error);
        return NextResponse.json({ error: error.message || 'Failed to create purchase' }, { status: 500 });
    }
}
