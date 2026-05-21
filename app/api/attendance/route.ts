import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const month = searchParams.get('month'); // YYYY-MM
        
        const client = await pool.connect();
        
        // Ensure table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id UUID PRIMARY KEY,
                staff_id UUID NOT NULL,
                date DATE NOT NULL,
                status VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(staff_id, date)
            )
        `);
        // Add new columns if they don't exist
        await client.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS in_time TIME');
        await client.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS out_time TIME');
        await client.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS note TEXT');

        let query = `
            SELECT a.* FROM attendance a
            JOIN staff s ON a.staff_id = s.id
            WHERE s.created_by = $1
        `;
        let params: any[] = [userId];

        if (date) {
            query += ' AND a.date = $2';
            params.push(date);
        } else if (month) {
            query += ` AND TO_CHAR(a.date, 'YYYY-MM') = $2`;
            params.push(month);
        }
        
        const result = await client.query(query, params);
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const { staff_id, date, status, in_time, out_time, note } = body;
        
        if (!staff_id || !date || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const attendanceId = uuidv4();
        const client = await pool.connect();
        
        // Verify staff belongs to user
        const staffCheck = await client.query('SELECT id FROM staff WHERE id = $1 AND created_by = $2', [staff_id, userId]);
        if (staffCheck.rowCount === 0) {
            client.release();
            return NextResponse.json({ error: 'Unauthorized to mark attendance for this staff' }, { status: 403 });
        }

        // Ensure table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id UUID PRIMARY KEY,
                staff_id UUID NOT NULL,
                date DATE NOT NULL,
                status VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(staff_id, date)
            )
        `);
        // Add new columns if they don't exist
        await client.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS in_time TIME');
        await client.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS out_time TIME');
        await client.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS note TEXT');

        // Upsert attendance (if already exists for that date, update status)
        await client.query(
            `INSERT INTO attendance (id, staff_id, date, status, in_time, out_time, note) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (staff_id, date) 
             DO UPDATE SET status = EXCLUDED.status, 
                           in_time = COALESCE(EXCLUDED.in_time, attendance.in_time), 
                           out_time = COALESCE(EXCLUDED.out_time, attendance.out_time),
                           note = COALESCE(EXCLUDED.note, attendance.note),
                           created_at = CURRENT_TIMESTAMP`,
            [attendanceId, staff_id, date, status, in_time || null, out_time || null, note || null]
        );
        
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
    }
}
