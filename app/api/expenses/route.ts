import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Fetch all expenses
export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        let query = `
      SELECT * FROM expenses
      ORDER BY expense_date DESC, created_at DESC
    `;
        const params: any[] = [];

        if (category) {
            query = `
        SELECT * FROM expenses
        WHERE category = $1
        ORDER BY expense_date DESC
      `;
            params.push(category);
        } else if (startDate && endDate) {
            query = `
        SELECT * FROM expenses
        WHERE expense_date BETWEEN $1 AND $2
        ORDER BY expense_date DESC
      `;
            params.push(startDate, endDate);
        }

        const result = await pool.query(query, params);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('GET Expenses Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new expense
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            expense_number,
            category,
            vendor_name,
            amount,
            expense_date,
            payment_method,
            receipt_no,
            notes
        } = body;

        const query = `
      INSERT INTO expenses (
        expense_number, category, vendor_name, amount,
        expense_date, payment_method, receipt_no, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

        const result = await pool.query(query, [
            expense_number || null,
            category,
            vendor_name || '',
            amount,
            expense_date,
            payment_method || '',
            receipt_no || '',
            notes || ''
        ]);

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('POST Expense Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete expense
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
        }

        const query = `DELETE FROM expenses WHERE id = $1`;
        await pool.query(query, [id]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('DELETE Expense Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
