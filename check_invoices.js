
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

async function checkInvoices() {
    try {
        const userId = 'a6554f45-9757-420e-b3e2-40312aad3e34';
        const client = await pool.connect();

        const res = await client.query("SELECT COUNT(*) FROM invoices WHERE created_by = $1", [userId]);
        console.log(`Invoices for User ${userId}:`, res.rows[0].count);

        const res2 = await client.query("SELECT COUNT(*) FROM invoices");
        console.log(`Total Invoices in DB:`, res2.rows[0].count);

        client.release();
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkInvoices();
