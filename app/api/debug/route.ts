
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkLimit } from "@/lib/subscription";

export const dynamic = 'force-dynamic';

export async function GET() {
    const report: any = {
        checks: [],
        session: null,
        db: false,
        schema: {},
        limit: null
    };

    try {
        // 1. Check Session
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        report.session = { user_id: session.user?.id, email: session.user?.email };
        report.checks.push({ name: 'Session', status: 'OK', details: report.session });

        // 2. DB Connection
        const client = await pool.connect();
        try {
            await client.query('SELECT 1');
            report.db = true;
            report.checks.push({ name: 'DB Connection', status: 'OK' });

            // 3. Check Quotations Table Schema
            const schemaRes = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'quotations'
            `);
            const columns = schemaRes.rows.map((r: any) => r.column_name);
            report.schema.quotations = columns;

            const hasCreatedBy = columns.includes('created_by');
            report.checks.push({ name: 'Schema: quotations.created_by', status: hasCreatedBy ? 'OK' : 'MISSING' });

            // 4. Check User Data & Limits if logged in
            if (session?.user?.id) {
                const userRes = await client.query('SELECT * FROM users WHERE id = $1', [session.user.id]);
                if (userRes.rows.length === 0) {
                    report.checks.push({ name: 'User in DB', status: 'MISSING' });
                } else {
                    const u = userRes.rows[0];
                    report.checks.push({
                        name: 'User Plan Data',
                        status: 'OK',
                        details: { plan: u.plan_type, status: u.subscription_status, expiry: u.plan_expiry }
                    });

                    // Check Limit Function
                    const limitRes = await checkLimit(session.user.id, 'QUOTATION');
                    report.limit = limitRes;
                    report.checks.push({ name: 'Limit Check (QUOTATION)', status: limitRes.allowed ? 'OK' : 'BLOCKED', details: limitRes });
                }
            }

        } finally {
            client.release();
        }

        return NextResponse.json(report);

    } catch (error: any) {
        report.error = error.message;
        report.checks.push({ name: 'Critical Failure', status: 'ERROR', details: error.message });
        return NextResponse.json(report, { status: 500 });
    }
}
