import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        const email = session?.user?.email;
        const personalId = session?.user?.personalId || session?.user?.id;

        if (!email || !personalId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();

        // 1. Fetch their personal workspace
        const personalResult = await client.query(
            "SELECT id, business_name, role FROM users WHERE id = $1 LIMIT 1",
            [personalId]
        );

        let workspaces = [];

        if (personalResult.rows.length > 0) {
            const user = personalResult.rows[0];
            workspaces.push({
                id: user.id,
                name: user.business_name || 'My Personal Business',
                role: user.role || 'USER',
                type: 'PERSONAL'
            });
        }

        // 2. Fetch any workspaces where they are staff
        const staffResult = await client.query(
            `SELECT s.role, s.created_by as tenant_id, u.business_name 
             FROM staff s 
             JOIN users u ON s.created_by = u.id 
             WHERE s.email = $1 AND s.role IS NOT NULL AND s.role <> 'Worker' AND s.role <> 'USER'`,
            [email]
        );

        for (const row of staffResult.rows) {
            // Avoid duplicate personal workspace if they somehow added themselves
            if (row.tenant_id !== personalId) {
                workspaces.push({
                    id: row.tenant_id,
                    name: row.business_name || 'Company',
                    role: row.role,
                    type: 'STAFF'
                });
            }
        }

        client.release();
        return NextResponse.json({ workspaces });

    } catch (error: any) {
        console.error('Workspaces API error:', error);
        return NextResponse.json({ error: 'Failed to load workspaces' }, { status: 500 });
    }
}
