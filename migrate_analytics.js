import pg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running Analytics migrations...');

        // 1. Store Views Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS store_views (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ store_views table created');

        // 2. Product Clicks Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS store_clicks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id UUID NOT NULL,
                product_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ store_clicks table created');

        // 3. Enquiries Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS store_enquiries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id UUID NOT NULL,
                customer_name VARCHAR(255),
                customer_phone VARCHAR(20),
                message TEXT,
                product_id UUID,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ store_enquiries table created');

        console.log('🚀 Analytics migrations completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
