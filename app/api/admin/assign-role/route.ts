import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { normalizeRole, isOwnerRole } from '@/lib/role-utils';

const VALID_ROLES = ['USER', 'SECURITY', 'ACCOUNTANT', 'OWNER', 'ADMIN'];

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any);
    const role = normalizeRole(session?.user?.role);
    const canAccess = isOwnerRole(role) || ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'].includes(session?.user?.email || '');

    if (!canAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);

    // Only return records with an explicitly assigned role different than the default 'USER'
    const usersResult = await client.query("SELECT id, name, email, phone, role, created_at FROM users WHERE role IS NOT NULL AND role <> 'USER' ORDER BY created_at DESC");
    const staffResult = await client.query("SELECT id, name, email, phone, role, created_at FROM staff WHERE role IS NOT NULL AND role <> 'USER' ORDER BY created_at DESC");
    client.release();

    return NextResponse.json({ users: usersResult.rows, staff: staffResult.rows });
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

    const body = await request.json();
    const rawIdentifiers = (body.email || '').toString().split(',').map((item: string) => item.trim()).filter(Boolean);
    const roleToAssign = (body.role || '').toString().trim().toUpperCase();

    if (rawIdentifiers.length === 0 || !roleToAssign || !VALID_ROLES.includes(roleToAssign)) {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 });
    }

    const client = await pool.connect();
    await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);

    const updated: any[] = [];
    const notFound: string[] = [];

    for (const identifier of rawIdentifiers) {
      const normalizedIdentifier = identifier.toLowerCase();
      const userResult = await client.query(
        'SELECT id, email FROM users WHERE LOWER(email) = $1 OR phone = $2 OR LOWER(name) = $3 LIMIT 1',
        [normalizedIdentifier, identifier, normalizedIdentifier]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        await client.query('UPDATE users SET role = $1 WHERE id = $2', [roleToAssign, user.id]);
        updated.push({ target: user.email || identifier, type: 'user' });
        continue;
      }

      const staffResult = await client.query(
        'SELECT id, name, email, phone FROM staff WHERE LOWER(email) = $1 OR LOWER(phone) = $2 OR LOWER(name) = $3 LIMIT 1',
        [normalizedIdentifier, normalizedIdentifier, normalizedIdentifier]
      );

      if (staffResult.rows.length > 0) {
        const staff = staffResult.rows[0];
        await client.query('UPDATE staff SET role = $1 WHERE id = $2', [roleToAssign, staff.id]);
        updated.push({ target: staff.email || staff.phone || staff.name || identifier, type: 'staff' });
        continue;
      }

      notFound.push(identifier);
    }

    client.release();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'No matching users found' }, { status: 404 });
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
