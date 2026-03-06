
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

async function findGhanshyam() {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT name, email, phone FROM users WHERE name ILIKE '%Ghanshyam%' OR email ILIKE '%gpaliwal%'");
        console.log("Found User:", result.rows);
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

findGhanshyam();
