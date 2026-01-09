import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Fetch business profile
export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();

        // Fetch business profile from users table
        const result = await client.query(
            `SELECT business_name, business_gstin, business_address, business_phone, 
                    business_email, business_logo, business_upi_id, business_owner_name 
             FROM users WHERE id = $1`,
            [session.user.id]
        );

        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Map database fields to businessProfile format
        const dbRow = result.rows[0];
        const businessProfile = {
            name: dbRow.business_name || 'My Business',
            gstin: dbRow.business_gstin || '',
            address: dbRow.business_address || '',
            phone: dbRow.business_phone || '',
            email: dbRow.business_email || '',
            logo: dbRow.business_logo || null,
            upi_id: dbRow.business_upi_id || '',
            owner_name: dbRow.business_owner_name || ''
        };

        return NextResponse.json(businessProfile);
    } catch (error) {
        console.error('Error fetching business profile:', error);
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
        console.log('Business Profile API: Saving profile for user:', session.user.id);
        console.log('Business Profile API: Data received:', data);

        client = await pool.connect();

        try {
            // Update business profile in users table
            const result = await client.query(
                `UPDATE users 
                 SET business_name = $1, 
                     business_gstin = $2, 
                     business_address = $3, 
                     business_phone = $4, 
                     business_email = $5, 
                     business_logo = $6, 
                     business_upi_id = $7, 
                     business_owner_name = $8
                 WHERE id = $9
                 RETURNING business_name, business_gstin, business_address, business_phone, 
                           business_email, business_logo, business_upi_id, business_owner_name`,
                [
                    data.name || 'My Business',
                    data.gstin || '',
                    data.address || '',
                    data.phone || '',
                    data.email || '',
                    data.logo || null,
                    data.upi_id || '',
                    data.owner_name || '',
                    session.user.id
                ]
            );

            if (result.rows.length === 0) {
                client.release();
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Map back to businessProfile format
            const dbRow = result.rows[0];
            const businessProfile = {
                name: dbRow.business_name || 'My Business',
                gstin: dbRow.business_gstin || '',
                address: dbRow.business_address || '',
                phone: dbRow.business_phone || '',
                email: dbRow.business_email || '',
                logo: dbRow.business_logo || null,
                upi_id: dbRow.business_upi_id || '',
                owner_name: dbRow.business_owner_name || ''
            };

            client.release();
            console.log('Business Profile API: Profile saved successfully');
            return NextResponse.json({ success: true, data: businessProfile });

        } catch (dbError: any) {
            console.error('Business Profile API: Database error:', dbError);
            console.error('Business Profile API: Error code:', dbError?.code);
            console.error('Business Profile API: Error message:', dbError?.message);

            // Auto-migration: If columns missing, add them
            if (dbError?.code === '42703') {
                console.log('Business Profile API: Missing columns detected. Adding columns...');
                try {
                    await client.query(`
                        ALTER TABLE users 
                        ADD COLUMN IF NOT EXISTS business_name VARCHAR(255) DEFAULT 'My Business',
                        ADD COLUMN IF NOT EXISTS business_gstin VARCHAR(20),
                        ADD COLUMN IF NOT EXISTS business_address TEXT,
                        ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20),
                        ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
                        ADD COLUMN IF NOT EXISTS business_logo TEXT,
                        ADD COLUMN IF NOT EXISTS business_upi_id VARCHAR(100),
                        ADD COLUMN IF NOT EXISTS business_owner_name VARCHAR(255);
                    `);
                    console.log('Business Profile API: Columns added successfully. Retrying update...');

                    // Retry the update
                    const result = await client.query(
                        `UPDATE users 
                         SET business_name = $1, 
                             business_gstin = $2, 
                             business_address = $3, 
                             business_phone = $4, 
                             business_email = $5, 
                             business_logo = $6, 
                             business_upi_id = $7, 
                             business_owner_name = $8
                         WHERE id = $9
                         RETURNING business_name, business_gstin, business_address, business_phone, 
                                   business_email, business_logo, business_upi_id, business_owner_name`,
                        [
                            data.name || 'My Business',
                            data.gstin || '',
                            data.address || '',
                            data.phone || '',
                            data.email || '',
                            data.logo || null,
                            data.upi_id || '',
                            data.owner_name || '',
                            session.user.id
                        ]
                    );

                    const dbRow = result.rows[0];
                    const businessProfile = {
                        name: dbRow.business_name || 'My Business',
                        gstin: dbRow.business_gstin || '',
                        address: dbRow.business_address || '',
                        phone: dbRow.business_phone || '',
                        email: dbRow.business_email || '',
                        logo: dbRow.business_logo || null,
                        upi_id: dbRow.business_upi_id || '',
                        owner_name: dbRow.business_owner_name || ''
                    };

                    client.release();
                    console.log('Business Profile API: Profile saved successfully after migration');
                    return NextResponse.json({ success: true, data: businessProfile });
                } catch (migrationError) {
                    console.error('Business Profile API: Migration failed:', migrationError);
                    throw migrationError;
                }
            }
            throw dbError;
        }
    } catch (error: any) {
        console.error('Business Profile API: Top-level error:', error);
        console.error('Business Profile API: Error stack:', error?.stack);
        if (client) {
            client.release();
        }
        return NextResponse.json({
            error: 'Failed to save business profile',
            details: error?.message
        }, { status: 500 });
    }
}
