import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Fetch business profile
export async function GET() {
    let client;
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        client = await pool.connect();

        try {
            // Fetch business profile from users table
            const result = await client.query(
                `SELECT business_name, business_gstin, business_address, business_phone, 
                        business_email, business_logo, business_upi_id, business_owner_name,
                        business_bank_name, business_account_no, business_ifsc_code, business_branch_name,
                        business_account_holder, business_show_bank_details,
                        plan_type, invoice_template, invoice_table_format
                 FROM users WHERE id = $1`,
                [session.user.id]
            );

            if (result.rows.length === 0) {
                client.release();
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const dbRow = result.rows[0];
            const businessProfile = {
                name: dbRow.business_name || 'My Business',
                gstin: dbRow.business_gstin || '',
                address: dbRow.business_address || '',
                phone: dbRow.business_phone || '',
                email: dbRow.business_email || '',
                logo: dbRow.business_logo || null,
                upi_id: dbRow.business_upi_id || '',
                owner_name: dbRow.business_owner_name || '',
                bank_name: dbRow.business_bank_name || '',
                account_no: dbRow.business_account_no || '',
                ifsc_code: dbRow.business_ifsc_code || '',
                branch_name: dbRow.business_branch_name || '',
                account_holder: dbRow.business_account_holder || '',
                show_bank_details: dbRow.business_show_bank_details ?? true,
                plan_type: dbRow.plan_type || 'FREE',
                invoice_template: dbRow.invoice_template || 'TEMPLATE_1',
                invoice_table_format: dbRow.invoice_table_format || 'FORMAT_1',
                id: session.user.id
            };

            client.release();
            return NextResponse.json(businessProfile);

        } catch (dbError: any) {
            // Missing columns handling for GET
            if (dbError?.code === '42703') {
                console.log('GET Profile: Missing columns. Running migration...');
                await client.query(`
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS business_name VARCHAR(255) DEFAULT 'My Business',
                    ADD COLUMN IF NOT EXISTS business_gstin VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS business_address TEXT,
                    ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_logo TEXT,
                    ADD COLUMN IF NOT EXISTS business_upi_id VARCHAR(100),
                    ADD COLUMN IF NOT EXISTS business_owner_name VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_bank_name VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_account_no VARCHAR(50),
                    ADD COLUMN IF NOT EXISTS business_ifsc_code VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS business_branch_name VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_account_holder VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_show_bank_details BOOLEAN DEFAULT TRUE,
                    ADD COLUMN IF NOT EXISTS invoice_template VARCHAR(50) DEFAULT 'TEMPLATE_1',
                    ADD COLUMN IF NOT EXISTS invoice_table_format VARCHAR(50) DEFAULT 'FORMAT_1';
                `);

                // Retry query once
                const retryResult = await client.query(
                    `SELECT business_name, business_gstin, business_address, business_phone, 
                            business_email, business_logo, business_upi_id, business_owner_name,
                            business_bank_name, business_account_no, business_ifsc_code, business_branch_name,
                            business_account_holder, business_show_bank_details,
                            plan_type, invoice_template, invoice_table_format
                     FROM users WHERE id = $1`,
                    [session.user.id]
                );

                client.release();
                if (retryResult.rows.length > 0) {
                    const r = retryResult.rows[0];
                    return NextResponse.json({
                        name: r.business_name || 'My Business',
                        gstin: r.business_gstin || '',
                        address: r.business_address || '',
                        plan_type: r.plan_type || 'FREE',
                        invoice_template: r.invoice_template || 'TEMPLATE_1',
                        invoice_table_format: r.invoice_table_format || 'FORMAT_1',
                        id: session.user.id
                    });
                }
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('Error fetching business profile:', error);
        if (client) client.release();
        return NextResponse.json({ error: 'Failed to fetch business profile' }, { status: 500 });
    }
}

// POST - Save/Update business profile
export async function POST(request: Request) {
    let client;
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        client = await pool.connect();

        try {
            const result = await client.query(
                `UPDATE users 
                 SET business_name = $1, 
                     business_gstin = $2, 
                     business_address = $3, 
                     business_phone = $4, 
                     business_email = $5, 
                     business_logo = $6, 
                     business_upi_id = $7, 
                     business_owner_name = $8,
                     business_bank_name = $9,
                     business_account_no = $10,
                     business_ifsc_code = $11,
                     business_branch_name = $12,
                     business_account_holder = $13,
                     business_show_bank_details = $14,
                     invoice_template = $16,
                     invoice_table_format = $17
                 WHERE id = $15
                 RETURNING business_name, business_gstin, business_address, business_phone, 
                           business_email, business_logo, business_upi_id, business_owner_name,
                           business_bank_name, business_account_no, business_ifsc_code, business_branch_name,
                           business_account_holder, business_show_bank_details,
                           plan_type, invoice_template, invoice_table_format`,
                [
                    data.name || 'My Business',
                    data.gstin || '',
                    data.address || '',
                    data.phone || '',
                    data.email || '',
                    data.logo || null,
                    data.upi_id || '',
                    data.owner_name || '',
                    data.bank_name || '',
                    data.account_no || '',
                    data.ifsc_code || '',
                    data.branch_name || '',
                    data.account_holder || '',
                    data.show_bank_details ?? true,
                    session.user.id,
                    data.invoice_template || 'TEMPLATE_1',
                    data.invoice_table_format || 'FORMAT_1'
                ]
            );

            if (result.rows.length === 0) {
                client.release();
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const dbRow = result.rows[0];
            client.release();
            return NextResponse.json({
                success: true,
                data: {
                    ...dbRow,
                    name: dbRow.business_name,
                    gstin: dbRow.business_gstin,
                    address: dbRow.business_address,
                    invoice_table_format: dbRow.invoice_table_format
                }
            });

        } catch (dbError: any) {
            if (dbError?.code === '42703') {
                await client.query(`
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS business_bank_name VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_account_no VARCHAR(50),
                    ADD COLUMN IF NOT EXISTS business_ifsc_code VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS business_branch_name VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_account_holder VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS business_show_bank_details BOOLEAN DEFAULT TRUE,
                    ADD COLUMN IF NOT EXISTS invoice_template VARCHAR(50) DEFAULT 'TEMPLATE_1',
                    ADD COLUMN IF NOT EXISTS invoice_table_format VARCHAR(50) DEFAULT 'FORMAT_1';
                `);
                client.release();
                return NextResponse.json({ success: false, error: 'Database migrated. Please retry saving.' });
            }
            throw dbError;
        }
    } catch (error: any) {
        if (client) client.release();
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
