import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '500');
        const offset = (page - 1) * limit;

        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const client = await pool.connect();
        
        // Ensure table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS staff (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                role VARCHAR(100),
                daily_wage NUMERIC DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS created_by VARCHAR(255)');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_type VARCHAR(20) DEFAULT \'daily\'');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC DEFAULT 0');

        const result = await client.query('SELECT * FROM staff WHERE created_by = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
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
        const { id, name, phone, role, daily_wage, salary_type, monthly_salary } = body;
        
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const staffId = id || uuidv4();
        
        const client = await pool.connect();
        
        // Ensure table exists just in case POST is called first
        await client.query(`
            CREATE TABLE IF NOT EXISTS staff (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                role VARCHAR(100),
                daily_wage NUMERIC DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS created_by VARCHAR(255)');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS advance NUMERIC DEFAULT 0');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_type VARCHAR(20) DEFAULT \'daily\'');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC DEFAULT 0');

        await client.query(
            `INSERT INTO staff (id, name, email, phone, role, daily_wage, created_by, salary_type, monthly_salary) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [staffId, name, body.email?.trim() || '', phone || '', role || 'Worker', daily_wage || 0, userId, salary_type || 'daily', monthly_salary || 0]
        );
        
        client.release();
        return NextResponse.json({ success: true, id: staffId });
    } catch (error) {
        console.error('Error creating staff:', error);
        return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const { id, name, phone, role, daily_wage, advance, salary_type, monthly_salary } = body;
        
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }

        const client = await pool.connect();
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS advance NUMERIC DEFAULT 0');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_type VARCHAR(20) DEFAULT \'daily\'');
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC DEFAULT 0');
        
        await client.query(
            `UPDATE staff SET name = $1, email = $2, phone = $3, role = $4, daily_wage = $5, advance = $6, salary_type = $7, monthly_salary = $8 WHERE id = $9 AND created_by = $10`,
            [name, body.email?.trim() || '', phone || '', role || 'Worker', daily_wage || 0, advance || 0, salary_type || 'daily', monthly_salary || 0, id, userId]
        );
        
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating staff:', error);
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
        }

        const client = await pool.connect();
        await client.query(`DELETE FROM staff WHERE id = $1 AND created_by = $2`, [id, userId]);
        
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting staff:', error);
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
    }
}
