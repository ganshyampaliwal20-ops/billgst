import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { normalizeRole, isOwnerRole } from '@/lib/role-utils';
import { v4 as uuidv4 } from 'uuid';

const VALID_ROLES = ['USER', 'ATTENDANCE', 'ACCOUNTANT', 'SALES', 'OWNER', 'ADMIN'];

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any);
    const role = normalizeRole(session?.user?.role);
    const canAccess = isOwnerRole(role) || ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'].includes(session?.user?.email || '');

    if (!canAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownerId = session.user.personalId || session.user.id;
    const client = await pool.connect();
    
    // Only return staff records assigned by this owner that have a system role
    const staffResult = await client.query(
      "SELECT id, name, email, phone, role, created_at FROM staff WHERE created_by = $1 AND role IS NOT NULL AND role <> 'Worker' AND role <> 'USER' ORDER BY created_at DESC",
      [ownerId]
    );
    client.release();

    return NextResponse.json({ users: [], staff: staffResult.rows });
  } catch (error: any) {
    console.error('Role list error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    const role = normalizeRole(session?.user?.role);
    const canAccess = isOwnerRole(role) || ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'].includes(session?.user?.email || '');

    if (!canAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownerId = session.user.personalId || session.user.id;
    const body = await request.json();
    const rawIdentifiers = (body.email || '').toString().split(',').map((item: string) => item.trim()).filter(Boolean);
    const roleToAssign = (body.role || '').toString().trim().toUpperCase();

    if (rawIdentifiers.length === 0 || !roleToAssign || !VALID_ROLES.includes(roleToAssign)) {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 });
    }

    const client = await pool.connect();
    await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
    await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS created_by VARCHAR(255)`);

    const updated: any[] = [];
    const notFound: string[] = [];

    for (const identifier of rawIdentifiers) {
      const normalizedIdentifier = identifier.toLowerCase();
      const cleanPhone = identifier.replace(/[^0-9]/g, '');
      
      // 1. Check if they exist in staff table under THIS owner
      const staffResult = await client.query(
        "SELECT id, name, email, phone FROM staff WHERE created_by = $1 AND (LOWER(email) = $2 OR (LENGTH($3) >= 10 AND RIGHT(REPLACE(phone, ' ', ''), 10) = RIGHT($3, 10)) OR LOWER(name) = $4) LIMIT 1",
        [ownerId, normalizedIdentifier, cleanPhone, normalizedIdentifier]
      );

      if (staffResult.rows.length > 0) {
        // Update existing staff record
        const staff = staffResult.rows[0];
        await client.query('UPDATE staff SET role = $1 WHERE id = $2', [roleToAssign, staff.id]);
        updated.push({ target: staff.email || staff.phone || staff.name || identifier, type: 'staff' });
        continue;
      }

      // 2. If not found in staff, check if they are a registered user in the system
      const userResult = await client.query(
        "SELECT id, name, email, phone FROM users WHERE LOWER(email) = $1 OR (LENGTH($2) >= 10 AND RIGHT(REPLACE(phone, ' ', ''), 10) = RIGHT($2, 10)) LIMIT 1",
        [normalizedIdentifier, cleanPhone]
      );

      if (userResult.rows.length > 0) {
        // Add them to staff table for THIS owner
        const user = userResult.rows[0];
        await client.query(
          'INSERT INTO staff (id, name, email, phone, role, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
          [uuidv4(), user.name, user.email, user.phone, roleToAssign, ownerId]
        );
        updated.push({ target: user.email || identifier, type: 'user_invited_to_staff' });
        continue;
      }

      // 3. Not found anywhere
      notFound.push(identifier);
    }

    client.release();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'No matching registered users or staff found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Role updated to ${roleToAssign} for ${updated.length} record(s).`,
      updated,
      notFound,
    });
  } catch (error: any) {
    console.error('Role assignment error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
