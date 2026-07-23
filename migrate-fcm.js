import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);`);
        console.log('Successfully added fcm_token column to users table');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        pool.end();
    }
}
run();
