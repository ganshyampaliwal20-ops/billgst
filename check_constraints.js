
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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

async function checkConstraints() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND is_nullable = 'NO'
            AND column_name NOT IN ('id', 'name', 'email', 'password');
        `);
        console.log("NOT NULL columns without simple defaults:", res.rows);
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkConstraints();
