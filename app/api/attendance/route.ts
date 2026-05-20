import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
    try {
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

        let query = 'SELECT * FROM attendance';
        let params: any[] = [];

        if (date) {
            query += ' WHERE date = $1';
            params.push(date);
        } else if (month) {
            query += ` WHERE TO_CHAR(date, 'YYYY-MM') = $1`;
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
        const body = await req.json();
        const { staff_id, date, status } = body;
        
        if (!staff_id || !date || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const attendanceId = uuidv4();
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

        // Upsert attendance (if already exists for that date, update status)
        await client.query(
            `INSERT INTO attendance (id, staff_id, date, status) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (staff_id, date) 
             DO UPDATE SET status = EXCLUDED.status, created_at = CURRENT_TIMESTAMP`,
            [attendanceId, staff_id, date, status]
        );
        
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
    }
}
