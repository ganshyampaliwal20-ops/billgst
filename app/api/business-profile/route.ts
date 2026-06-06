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
            console.warn('Business Profile GET: Unauthorized access attempt. Session missing user ID.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        client = await pool.connect();

        const fetchQuery = `
            SELECT business_name, business_gstin, business_address, business_phone, 
                   business_email, business_logo, business_upi_id, business_owner_name,
                   business_bank_name, business_account_no, business_ifsc_code, business_branch_name,
                   business_account_holder, business_show_bank_details,
                   plan_type, invoice_template, invoice_table_format,
                   business_signature, business_logo_position,
                   auto_reminders_enabled, reminder_frequency, reminder_time,
                   whatsapp_bot_enabled, whatsapp_sender_number, whatsapp_api_key, whatsapp_api_url,
                   business_terms_and_conditions, store_banner
            FROM users WHERE id = $1`;

        try {
            let result = await client.query(fetchQuery, [userId]);
            let dbRow = result.rows[0];

            // If the user's profile is empty/default, try to find if they are a staff member of an owner
            if (dbRow && (!dbRow.business_name || dbRow.business_name === 'My Business' || !dbRow.business_logo)) {
                if (userEmail) {
                    const staffResult = await client.query('SELECT created_by FROM staff WHERE email = $1 LIMIT 1', [userEmail]);
                    if (staffResult.rows.length > 0 && staffResult.rows[0].created_by) {
                        const ownerId = staffResult.rows[0].created_by;
                        const ownerProfileResult = await client.query(fetchQuery, [ownerId]);
                        if (ownerProfileResult.rows.length > 0) {
                            dbRow = ownerProfileResult.rows[0];
                        }
                    }
                }
            }

            if (!dbRow) {
                client.release();
                console.error(`Business Profile GET: User ${userId} not found in database.`);
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const normalizedProfile = normalizeProfile(dbRow, userId);

            client.release();
            return NextResponse.json(normalizedProfile);

        } catch (dbError: any) {
            // Missing columns handling for GET
            if (dbError?.code === '42703' || dbError?.code === '42P01') {

                await runMigration(client);

                // Retry query once
                const retryResult = await client.query(fetchQuery, [userId]);

                client.release();
                if (retryResult.rows.length > 0) {
                    return NextResponse.json(normalizeProfile(retryResult.rows[0], userId));
                }
                return NextResponse.json({ error: 'Failed to fetch after migration' }, { status: 500 });
            }
            if (client) client.release();
            throw dbError;
        }

    } catch (error) {
        console.error('Error in GET business-profile:', error);
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
            console.warn('Business Profile POST: Unauthorized access attempt.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const userId = session.user.id;
        client = await pool.connect();

        const updateQuery = `
            UPDATE users 
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
                invoice_table_format = $17,
                business_signature = $18,
                business_logo_position = $19,
                auto_reminders_enabled = $20,
                reminder_frequency = $21,
                reminder_time = $22,
                whatsapp_bot_enabled = $23,
                whatsapp_sender_number = $24,
                whatsapp_api_key = $25,
                whatsapp_api_url = $26,
                business_terms_and_conditions = $27,
                store_banner = $28
            WHERE id = $15
            RETURNING *`;

        const queryParams = [
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
            userId,
            data.invoice_template || 'TEMPLATE_1',
            data.invoice_table_format || 'FORMAT_1',
            data.signature || null,
            data.logo_position || 'RIGHT',
            data.autoRemindersEnabled ?? false,
            data.reminderFrequency ?? 3,
            data.reminderTime || '10:00',
            data.whatsappBotEnabled ?? false,
            data.whatsappSenderNumber || '',
            data.whatsappApiKey || '',
            data.whatsappApiUrl || '',
            data.terms_and_conditions || '',
            data.store_banner || null
        ];

        try {
            const result = await client.query(updateQuery, queryParams);

            if (result.rows.length === 0) {
                client.release();
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const dbRow = result.rows[0];
            client.release();
            return NextResponse.json({
                success: true,
                data: normalizeProfile(dbRow, userId)
            });

        } catch (dbError: any) {

            if (dbError?.code === '42703' || dbError?.code === '42P01') {

                await runMigration(client);

                // Retry Update
                const retryResult = await client.query(updateQuery, queryParams);

                client.release();
                if (retryResult.rows.length > 0) {
                    return NextResponse.json({
                        success: true,
                        data: normalizeProfile(retryResult.rows[0], userId)
                    });
                }
                return NextResponse.json({ success: false, message: 'Migration applied but update failed. Please try again.' });
            }
            if (client) client.release();
            throw dbError;
        }
    } catch (error: any) {
        console.error('Business Profile POST API Error:', error);
        if (client) client.release();
        return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 });
    }
}

// Helper to normalize DB row to frontend profile object
function normalizeProfile(dbRow: any, userId: string) {
    return {
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
        signature: dbRow.business_signature || null,
        logo_position: dbRow.business_logo_position || 'RIGHT',
        autoRemindersEnabled: dbRow.auto_reminders_enabled ?? false,
        reminderFrequency: dbRow.reminder_frequency ?? 3,
        reminderTime: dbRow.reminder_time || '10:00',
        whatsappBotEnabled: dbRow.whatsapp_bot_enabled ?? false,
        whatsapp_sender_number: dbRow.whatsapp_sender_number || '',
        whatsapp_api_key: dbRow.whatsapp_api_key || '',
        whatsapp_api_url: dbRow.whatsapp_api_url || '',
        terms_and_conditions: dbRow.business_terms_and_conditions || '',
        store_banner: dbRow.store_banner || null,
        id: userId
    };
}

// Unified migration function
async function runMigration(client: any) {
    return await client.query(`
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
        ADD COLUMN IF NOT EXISTS invoice_table_format VARCHAR(50) DEFAULT 'FORMAT_1',
        ADD COLUMN IF NOT EXISTS business_signature TEXT,
        ADD COLUMN IF NOT EXISTS business_logo_position VARCHAR(20) DEFAULT 'RIGHT',
        ADD COLUMN IF NOT EXISTS auto_reminders_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS reminder_frequency INTEGER DEFAULT 3,
        ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(10) DEFAULT '10:00',
        ADD COLUMN IF NOT EXISTS whatsapp_bot_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS whatsapp_sender_number VARCHAR(20),
        ADD COLUMN IF NOT EXISTS whatsapp_api_key TEXT,
        ADD COLUMN IF NOT EXISTS whatsapp_api_url TEXT,
        ADD COLUMN IF NOT EXISTS business_terms_and_conditions TEXT,
        ADD COLUMN IF NOT EXISTS store_banner TEXT;
    `);
}

