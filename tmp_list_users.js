
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

async function listUsers() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT id, name, email, phone FROM users");
        console.log("ALL_USERS_START");
        console.log(JSON.stringify(res.rows, null, 2));
        console.log("ALL_USERS_END");
        client.release();
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

listUsers();
