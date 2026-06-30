import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Find items in this purchase to revert stock
            const itemsRes = await client.query('SELECT product_id, quantity FROM purchase_items WHERE purchase_id = $1', [id]);
            const items = itemsRes.rows;

            // Revert Stock
            for (const item of items) {
                if (item.product_id) {
                    const qty = parseFloat(item.quantity) || 0;
                    await client.query(
                        `UPDATE products 
                         SET stock_quantity = COALESCE(stock_quantity, 0) - $1 
                         WHERE id = $2 AND created_by = $3`,
                        [qty, item.product_id, session.user.id]
                    );
                }
            }

            // Delete Purchase (cascade will delete items and payments)
            await client.query('DELETE FROM purchases WHERE id = $1 AND user_id = $2', [id, session.user.id]);

            await client.query('COMMIT');
            client.release();
            return NextResponse.json({ success: true });
        } catch (txError) {
            await client.query('ROLLBACK');
            client.release();
            throw txError;
        }
    } catch (error) {
        console.error('Error deleting purchase:', error);
        return NextResponse.json({ error: 'Failed to delete purchase bill' }, { status: 500 });
    }
}
