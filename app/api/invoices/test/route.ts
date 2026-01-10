import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Detailed diagnostics
        const diagnostics = {
            receivedData: data,
            customerType: typeof data.customer,
            customerValue: data.customer,
            customerId: typeof data.customer === 'object' ? data.customer?.id : data.customer,
            hasItems: !!data.items,
            itemsCount: data.items?.length || 0,
            firstItem: data.items?.[0] || null,
        };

        // Test database connection
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();

        return NextResponse.json({
            status: 'success',
            message: 'Diagnostics completed',
            diagnostics,
            database: 'connected'
        });

    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : null
        }, { status: 500 });
    }
}
