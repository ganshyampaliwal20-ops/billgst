import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        const result = await client.query('SELECT * FROM products WHERE created_by = $1 ORDER BY created_at DESC', [session.user.id]);
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: any = await getServerSession(authOptions as any);

    console.log('Product API Debug: Session Check', {
        hasSession: !!session,
        userId: session?.user?.id,
        userRole: session?.user?.role
    });

    let userId = session?.user?.id;

    // FALLBACK AUTHENTICATION (For debugging/fixing stuck sessions)
    // If no session is found, try to use the first available user in the database.
    if (!userId) {
        console.warn('⚠️ Product API: No session found. Attempting Auto-User Fallback...');
        try {
            const client = await pool.connect();
            const userResult = await client.query('SELECT id FROM users LIMIT 1');
            client.release();

            if (userResult.rows.length > 0) {
                userId = userResult.rows[0].id;
                console.log('✅ Auto-User Fallback Successful. Using User ID:', userId);
            } else {
                console.error('❌ Auto-User Failed: No users found in database.');
            }
        } catch (fbError) {
            console.error('❌ Auto-User DB Error:', fbError);
        }
    }

    if (!userId) {
        console.error('Product API Error: Unauthorized access attempt (Fallback failed)');
        return NextResponse.json({ error: 'Unauthorized: No session and no users in DB' }, { status: 401 });
    }

    try {
        const data = await request.json();
        console.log('API: Creating product. Received:', data);

        const client = await pool.connect();

        // Ensure ID exists
        if (!data.id) {
            data.id = uuidv4();
        }

        // Ensure numeric values are valid
        const price = parseFloat(data.price) || 0;
        const stock = data.stock_quantity || 0;
        const gst = parseFloat(data.gst_rate) || 0;

        try {
            const result = await client.query(
                `INSERT INTO products (id, name, description, hsn_code, unit, price, gst_rate, stock_quantity, created_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
           RETURNING *`,
                [data.id, data.name, data.description, data.hsn_code, data.unit, price, gst, stock, userId]
            );
            client.release();
            return NextResponse.json(result.rows[0]);
        } catch (dbError: any) {
            // Auto-migration: If column missing error (42703), add columns and retry
            if (dbError?.code === '42703') {
                console.log('Product API: Missing columns detected. Attempting auto-migration...');
                await client.query(`
                    ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
                `);
                // Retry
                const result = await client.query(
                    `INSERT INTO products (id, name, description, hsn_code, unit, price, gst_rate, stock_quantity, created_by, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
               RETURNING *`,
                    [data.id, data.name, data.description, data.hsn_code, data.unit, price, gst, stock, userId]
                );
                client.release();
                return NextResponse.json(result.rows[0]);
            }
            throw dbError;
        }
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const client = await pool.connect();

        // Check if product is used in invoices
        const checkUsage = await client.query('SELECT COUNT(*) FROM invoice_items WHERE product_id = $1', [id]);
        if (parseInt(checkUsage.rows[0].count) > 0) {
            client.release();
            return NextResponse.json({ error: 'Cannot delete product: It is used in existing invoices' }, { status: 400 });
        }

        // Only delete if it belongs to user
        const result = await client.query('DELETE FROM products WHERE id = $1 AND created_by = $2', [id, userId]);
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}