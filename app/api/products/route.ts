import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Please create an account or login to continue' }, { status: 401 });
        }

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM products 
                WHERE created_by = $1 AND (status IS NULL OR status != 'INACTIVE')
                ORDER BY created_at DESC
            `, [session.user.id]);
            client.release();
            return NextResponse.json(result.rows);
        } catch (dbError: any) {
            if (dbError?.code === '42703') {
                console.log('Product GET API: Missing columns. Migrating...');
                await client.query(`
                    ALTER TABLE products 
                    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
                    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
                `);
                const result = await client.query(`
                    SELECT * FROM products 
                    WHERE created_by = $1 AND (status IS NULL OR status != 'INACTIVE')
                    ORDER BY created_at DESC
                `, [session.user.id]);
                client.release();
                return NextResponse.json(result.rows);
            }
            client.release();
            throw dbError;
        }
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

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Please create an account or login to continue' }, { status: 401 });
    }

    const userId = session.user.id;

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
        const purchasePrice = parseFloat(data.purchase_price) || 0;
        const stock = data.stock_quantity || 0;
        const gst = parseFloat(data.gst_rate) || 0;

        try {
            const productType = data.type || 'PRODUCT';
            const result = await client.query(
                `INSERT INTO products (id, name, description, hsn_code, unit, price, purchase_price, gst_rate, stock_quantity, created_by, type, image_url, expiry_date, expiry_alert_days, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()) 
           RETURNING *`,
                [
                    data.id, 
                    data.name, 
                    data.description ?? null, 
                    data.hsn_code ?? null, 
                    data.unit ?? 'PCS', 
                    price, 
                    purchasePrice, 
                    gst, 
                    stock, 
                    userId, 
                    productType, 
                    data.image_url ?? null, 
                    data.expiry_date ?? null, 
                    data.expiry_alert_days ?? 10
                ]
            );
            client.release();
            return NextResponse.json(result.rows[0]);
        } catch (dbError: any) {
            // Auto-migration: If column missing error (42703), add columns and retry
            if (dbError?.code === '42703') {
                console.log('Product API: Missing columns detected. Attempting auto-migration...');
                await client.query(`
                    ALTER TABLE products 
                    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
                    ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PRODUCT',
                    ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(15, 2) DEFAULT 0,
                    ADD COLUMN IF NOT EXISTS image_url TEXT,
                    ADD COLUMN IF NOT EXISTS expiry_date DATE,
                    ADD COLUMN IF NOT EXISTS expiry_alert_days INTEGER DEFAULT 10,
                    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
                `);
                // Retry
                const productType = data.type || 'PRODUCT';
                const result = await client.query(
                    `INSERT INTO products (id, name, description, hsn_code, unit, price, purchase_price, gst_rate, stock_quantity, created_by, type, image_url, expiry_date, expiry_alert_days, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()) 
               RETURNING *`,
                    [
                        data.id, 
                        data.name, 
                        data.description ?? null, 
                        data.hsn_code ?? null, 
                        data.unit ?? 'PCS', 
                        price, 
                        purchasePrice, 
                        gst, 
                        stock, 
                        userId, 
                        productType, 
                        data.image_url ?? null, 
                        data.expiry_date ?? null, 
                        data.expiry_alert_days ?? 10
                    ]
                );
                client.release();
                return NextResponse.json(result.rows[0]);
            }
            throw dbError;
        }
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: error.detail || error.message || 'Failed to create product' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Please create an account or login to continue' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const data = await request.json();
        const { id, name, description, hsn_code, unit, price, purchase_price, gst_rate, stock_quantity, image_url } = data;

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const client = await pool.connect();

        // Ensure the product belongs to the user
        const checkOwner = await client.query('SELECT created_by FROM products WHERE id = $1', [id]);
        if (checkOwner.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        if (checkOwner.rows[0].created_by !== userId) {
            client.release();
            return NextResponse.json({ error: 'Unauthorized: You do not own this product' }, { status: 403 });
        }

        const result = await client.query(
            `UPDATE products 
             SET name = $1, description = $2, hsn_code = $3, unit = $4, price = $5, purchase_price = $6, gst_rate = $7, stock_quantity = $8, type = $9, image_url = $10, expiry_date = $11, expiry_alert_days = $12, updated_at = NOW()
             WHERE id = $13 AND created_by = $14
             RETURNING *`,
            [name, description, hsn_code, unit, price, purchase_price || 0, gst_rate, stock_quantity, data.type || 'PRODUCT', image_url, data.expiry_date || null, data.expiry_alert_days || 10, id, userId]
        );
        client.release();

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Please create an account or login to continue' }, { status: 401 });
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
            // If used in invoices, mark as INACTIVE instead of hard delete
            await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'ACTIVE\'');
            await client.query('UPDATE products SET status = $1 WHERE id = $2 AND created_by = $3', ['INACTIVE', id, userId]);
            client.release();
            return NextResponse.json({ success: true, message: 'Product marked as inactive' });
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