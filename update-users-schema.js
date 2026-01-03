
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
    try {
        const client = await pool.connect();
        console.log("Connected to DB. Adding missing columns to 'users' table...");

        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
        `);

        console.log("✅ Successfully added 'reset_token' and 'reset_token_expiry' columns.");

        client.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
