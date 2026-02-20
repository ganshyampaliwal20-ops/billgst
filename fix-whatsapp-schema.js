import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Bypass SSL certificate check for local node execution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function fixSchema() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding missing columns to users table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS auto_reminders_enabled BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS reminder_frequency INTEGER DEFAULT 3,
            ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(10) DEFAULT '10:00',
            ADD COLUMN IF NOT EXISTS whatsapp_bot_enabled BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS whatsapp_sender_number VARCHAR(20),
            ADD COLUMN IF NOT EXISTS whatsapp_api_key TEXT,
            ADD COLUMN IF NOT EXISTS whatsapp_api_url TEXT;
        `);
        console.log('✅ Database schema updated successfully!');
    } catch (err) {
        console.error('❌ Error updating database:', err.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
