
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const data = await request.json();

        const client = await pool.connect();
        await client.query(`
            UPDATE expenses 
            SET category = $1, description = $2, expense_date = $3, amount = $4, payment_method = $5
            WHERE id = $6 AND created_by = $7
        `, [
            data.category,
            data.description,
            data.date,
            data.amount,
            data.paymentMethod,
            id,
            session.user.id
        ]);

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Expense Update Error:', error);
        return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const client = await pool.connect();

        await client.query('DELETE FROM expenses WHERE id = $1 AND created_by = $2', [id, session.user.id]);

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Expense Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
}
