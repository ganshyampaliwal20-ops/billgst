import { NextResponse } from 'next/server';
import pool, { initDB } from '../../../lib/db';

export async function GET() {
    try {
        // Attempt to initialize DB schema (create tables if missing)
        try {
            await initDB();
            console.log('Database schema initialized via /api/test-db');
        } catch (initError) {
            console.error('Schema initialization warning:', initError);
        }

        const client = await pool.connect();
        try {
            const result = await client.query('SELECT NOW()');
            return NextResponse.json({
                status: 'success',
                message: 'Database connected and schema initialized successfully!',
                time: result.rows[0].now
            });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Database connection error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Failed to connect to database',
            error: error.message
        }, { status: 500 });
    }
}
