import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { normalizeRole, isOwnerRole } from '@/lib/role-utils';

export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    const role = normalizeRole(session?.user?.role);
    const canAccess = isOwnerRole(role) || ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'].includes(session?.user?.email || '');
    if (!canAccess) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const identifier = (body.identifier || '').toString().trim();
    const source = body.source || 'user';
    const startDate = body.startDate || null; // YYYY-MM-DD
    const endDate = body.endDate || null; // YYYY-MM-DD

    if (!identifier) return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });

    const client = await pool.connect();

    if (source === 'staff') {
      // Try find staff by email/phone/name
      const normalized = identifier.toLowerCase();
      const staffRes = await client.query('SELECT id, name, email, phone, role FROM staff WHERE LOWER(email) = $1 OR LOWER(phone) = $2 OR LOWER(name) = $3 LIMIT 1', [normalized, normalized, normalized]);
      if (staffRes.rows.length === 0) {
        client.release();
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
      }
      const staff = staffRes.rows[0];
      let attendanceQuery = 'SELECT date, status, created_at FROM attendance WHERE staff_id = $1';
      const params: any[] = [staff.id];
      if (startDate && endDate) {
        attendanceQuery += ' AND date BETWEEN $2 AND $3';
        params.push(startDate, endDate);
      }
      attendanceQuery += ' ORDER BY date DESC LIMIT 200';
      const attendanceRes = await client.query(attendanceQuery, params);
      client.release();
      return NextResponse.json({ staff, attendance: attendanceRes.rows });
    }

    // source === 'user'
    const normalized = identifier.toLowerCase();
    const userRes = await client.query('SELECT id, name, email, role FROM users WHERE LOWER(email) = $1 OR phone = $2 OR LOWER(name) = $3 LIMIT 1', [normalized, identifier, normalized]);
    if (userRes.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userRes.rows[0];

    // Fetch invoices and expenses created by this user id
    // Build date filtered queries if dates provided
    let invoicesQuery = 'SELECT id, invoice_number, total_amount, status, created_at FROM invoices WHERE created_by = $1';
    let expensesQuery = 'SELECT id, category, description, amount, expense_date, created_at FROM expenses WHERE created_by = $1';
    const params: any[] = [user.id];
    if (startDate && endDate) {
      invoicesQuery += ' AND created_at BETWEEN $2 AND $3';
      expensesQuery += ' AND expense_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    invoicesQuery += ' ORDER BY created_at DESC LIMIT 200';
    expensesQuery += ' ORDER BY expense_date DESC LIMIT 200';

    const invoices = await client.query(invoicesQuery, params);
    const expenses = await client.query(expensesQuery, params);

    client.release();
    return NextResponse.json({ user, invoices: invoices.rows, expenses: expenses.rows });
  } catch (error: any) {
    console.error('User activity error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
