import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkLimit } from "@/lib/subscription";
import { v4 as uuidv4 } from 'uuid';

async function ensureGstReturnsTable(client: any) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS gst_returns (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            return_type VARCHAR(50) NOT NULL,
            period_from DATE NOT NULL,
            period_to DATE NOT NULL,
            filing_frequency VARCHAR(50) DEFAULT 'MONTHLY',
            generated_data JSONB,
            status VARCHAR(50) DEFAULT 'DRAFT',
            created_by UUID REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await client.query(`ALTER TABLE gst_returns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE CASCADE;`).catch(() => {});
    await client.query(`ALTER TABLE gst_returns ADD COLUMN IF NOT EXISTS generated_data JSONB;`).catch(() => {});
    await client.query(`ALTER TABLE gst_returns ADD COLUMN IF NOT EXISTS filing_frequency VARCHAR(50) DEFAULT 'MONTHLY';`).catch(() => {});
    await client.query(`ALTER TABLE gst_returns ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';`).catch(() => {});
}

// GET - Fetch all saved GST returns
export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        try {
            await ensureGstReturnsTable(client);

            const result = await client.query(
                `SELECT id, return_type, period_from, period_to, filing_frequency, 
                  status, created_at, updated_at
           FROM gst_returns 
           WHERE created_by = $1 
           ORDER BY created_at DESC`,
                [session.user.id]
            );

            return NextResponse.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error fetching GST returns:', error);
        return NextResponse.json({ error: 'Failed to fetch GST returns', details: error.message }, { status: 500 });
    }
}

// POST - Save a new GST return
export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Check Subscription Limit
        const limitCheck = await checkLimit(userId, 'GST_RETURN');
        if (!limitCheck.allowed) {
            return NextResponse.json({
                error: limitCheck.reason || 'Subscription limit reached. Please upgrade.'
            }, { status: 403 });
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
        try {
            await ensureGstReturnsTable(client);

            const newId = uuidv4();
            const result = await client.query(
                `INSERT INTO gst_returns 
           (id, return_type, period_from, period_to, filing_frequency, generated_data, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, return_type, period_from, period_to, status, created_at`,
                [
                    newId,
                    return_type,
                    period_from,
                    period_to,
                    filing_frequency || 'MONTHLY',
                    JSON.stringify(generated_data),
                    status || 'DRAFT',
                    userId
                ]
            );

            return NextResponse.json({ success: true, data: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error saving GST return:', error);
        return NextResponse.json({ error: 'Failed to save GST return', details: error.message }, { status: 500 });
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
