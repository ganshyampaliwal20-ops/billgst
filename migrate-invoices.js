
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Starting migration...');
        await pool.query(`
            ALTER TABLE invoices 
            ADD COLUMN IF NOT EXISTS eway_bill_no VARCHAR(20),
            ADD COLUMN IF NOT EXISTS eway_bill_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(20),
            ADD COLUMN IF NOT EXISTS distance INTEGER,
            ADD COLUMN IF NOT EXISTS transporter_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS transporter_id VARCHAR(50),
            ADD COLUMN IF NOT EXISTS vehicle_no VARCHAR(20),
            ADD COLUMN IF NOT EXISTS irn VARCHAR(100),
            ADD COLUMN IF NOT EXISTS ack_no VARCHAR(50),
            ADD COLUMN IF NOT EXISTS ack_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS signed_qrcode TEXT;
        `);
        console.log('✅ Migration successful: Columns added to invoices table.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
