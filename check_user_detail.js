
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

async function checkUserDetail() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT id, name, email, phone FROM users WHERE email = 'billgstapp@gmail.com'");
        const user = res.rows[0];
        console.log("USER_JSON_START");
        console.log(JSON.stringify(user));
        console.log("USER_JSON_END");

        if (user.name.endsWith(' ')) {
            console.log("Warning: Name has a trailing space!");
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkUserDetail();
