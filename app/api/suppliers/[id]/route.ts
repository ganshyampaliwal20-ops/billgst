import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const data = await request.json();
        const client = await pool.connect();

        const result = await client.query(
            `UPDATE suppliers 
             SET name = $1, email = $2, phone = $3, gstin = $4, address = $5, city = $6, state = $7, pincode = $8, updated_at = NOW()
             WHERE id = $9 AND user_id = $10
             RETURNING *`,
            [data.name, data.email || null, data.phone || null, data.gstin || null, data.address || null, data.city || null, data.state || null, data.pincode || null, id, session.user.id]
        );
        
        client.release();
        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Error updating supplier:', error);
        return NextResponse.json({ error: error.message || 'Failed to update supplier' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const client = await pool.connect();
        
        await client.query('DELETE FROM suppliers WHERE id = $1 AND user_id = $2', [id, session.user.id]);
        
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
    }
}
