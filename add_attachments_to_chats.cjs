const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query(`
            ALTER TABLE support_chats 
            ADD COLUMN IF NOT EXISTS attachment_url TEXT,
            ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50)
        `);
        console.log('Added attachment columns to support_chats successfully!');
    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        pool.end();
    }
}

run();
