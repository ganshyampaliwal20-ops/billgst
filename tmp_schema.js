process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addCol() {
    try {
        const client = await pool.connect();
        await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS has_claimed_free_plan boolean DEFAULT false;");
        console.log("Column added");
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

addCol();
