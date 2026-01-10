import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Fetch all saved GST returns
export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();

        const result = await client.query(
            `SELECT id, return_type, period_from, period_to, filing_frequency, 
              status, created_at, updated_at
       FROM gst_returns 
       WHERE created_by = $1 
       ORDER BY created_at DESC`,
            [session.user.id]
        );

        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching GST returns:', error);
        return NextResponse.json({ error: 'Failed to fetch GST returns' }, { status: 500 });
    }
}

// POST - Save a new GST return
export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        const { return_type, period_from, period_to, filing_frequency, generated_data, status } = data;

        if (!return_type || !period_from || !period_to || !generated_data) {
            return NextResponse.json(
                { error: 'Missing required fields: return_type, period_from, period_to, generated_data' },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        const result = await client.query(
            `INSERT INTO gst_returns 
       (return_type, period_from, period_to, filing_frequency, generated_data, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, return_type, period_from, period_to, status, created_at`,
            [
                return_type,
                period_from,
                period_to,
                filing_frequency || 'MONTHLY',
                JSON.stringify(generated_data),
                status || 'DRAFT',
                session.user.id
            ]
        );

        client.release();

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error saving GST return:', error);
        return NextResponse.json({ error: 'Failed to save GST return' }, { status: 500 });
    }
}

// DELETE - Delete a GST return
export async function DELETE(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Return ID is required' }, { status: 400 });
        }

        const client = await pool.connect();

        const result = await client.query(
            `DELETE FROM gst_returns 
       WHERE id = $1 AND created_by = $2
       RETURNING id`,
            [id, session.user.id]
        );

        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Return not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting GST return:', error);
        return NextResponse.json({ error: 'Failed to delete GST return' }, { status: 500 });
    }
}
