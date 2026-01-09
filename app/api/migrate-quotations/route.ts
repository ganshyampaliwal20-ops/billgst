import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                ALTER TABLE quotations 
                ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0;
            `);
            return NextResponse.json({ success: true, message: 'Migration successful: paid_amount added to quotations' });
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
