
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

async function debug() {
    try {
        const client = await pool.connect();
        console.log("Checking columns in 'users' table...");
        const colsRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        const columns = colsRes.rows.map(r => r.column_name);
        console.log("Columns:", columns);

        const requiredCols = ['name', 'email', 'password', 'role', 'plan_type', 'subscription_status'];
        const missing = requiredCols.filter(c => !columns.includes(c));

        if (missing.length > 0) {
            console.log("MISSING COLUMNS:", missing);
        } else {
            console.log("All required columns for registration exist.");
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Debug Error:', err);
    }
}

debug();
