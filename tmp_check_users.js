
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

async function checkUsers() {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log("Users Table Columns:", result.rows.map(r => r.column_name));
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUsers();
