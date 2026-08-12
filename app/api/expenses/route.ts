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

        const adminEmails = ['billgstapp@gmail.com', 'ganshyampaliwal20@gmail.com'];
        const isSuperAdmin = session.user.email && adminEmails.includes(session.user.email);

        let query: string;
        let params: any[] = [];
        if (isSuperAdmin) {
            query = `
                SELECT * FROM expenses
                WHERE is_deleted = FALSE
                ORDER BY expense_date DESC, created_at DESC
                LIMIT $1 OFFSET $2
            `;
            params = [limit, offset];
        } else {
            query = `
                SELECT * FROM expenses
                WHERE created_by = $1 AND is_deleted = FALSE
                ORDER BY expense_date DESC, created_at DESC
                LIMIT $2 OFFSET $3
            `;
            params = [userId, limit, offset];
        }

        let result;
        try {
            result = await client.query(query, params);
        } finally {
            client.release();
        }

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const client = await pool.connect();

    let data: any = {};
    try {
        data = await request.json();
    } catch (e) {
        client.release();
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    try {
        const expenseId = uuidv4();

        const result = await client.query(`
            INSERT INTO expenses (
                id, category, description, expense_date, amount, payment_method, created_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING id
        `, [
            expenseId,
            data.category,
            data.description,
            data.date,
            data.amount,
            data.paymentMethod,
            userId
        ]);

        client.release();
        return NextResponse.json({ success: true, id: result.rows[0].id });

    } catch (error: any) {
        if (error?.code === '42P01') { // relation "expenses" does not exist
            try {
                await client.query(`
                    CREATE TABLE IF NOT EXISTS expenses (
                        id UUID PRIMARY KEY,
                        category VARCHAR(100),
                        description TEXT,
                        expense_date DATE,
                        amount DECIMAL(15,2),
                        payment_method VARCHAR(50),
                        created_by VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                `);
                
                const expenseId = uuidv4();
                const retryResult = await client.query(`
                    INSERT INTO expenses (
                        id, category, description, expense_date, amount, payment_method, created_by, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    RETURNING id
                `, [
                    expenseId,
                    data.category,
                    data.description,
                    data.date,
                    data.amount,
                    data.paymentMethod,
                    userId
                ]);

                client.release();
                return NextResponse.json({ success: true, id: retryResult.rows[0].id });
            } catch (createErr) {
                console.error('Failed to create expenses table:', createErr);
            }
        }
        client.release();
        console.error('Expense POST Error:', error);
        return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
    }
}
