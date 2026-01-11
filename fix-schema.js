
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

async function runMigration() {
    try {
        const client = await pool.connect();
        console.log("Connected to DB. Running Schema Fixes...");

        // 1. Quotations - created_by
        try {
            await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);`);
            console.log("Checked quotations.created_by");
        } catch (e) { console.log("Error checking quotations:", e.message); }

        // 2. GST Returns - created_by
        // await client.query(`ALTER TABLE gst_returns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);`);
        // console.log("Checked gst_returns.created_by");

        // 3. Customers - created_by
        // await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);`);
        //  console.log("Checked customers.created_by");

        // 4. Products - created_by
        // await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);`);
        // console.log("Checked products.created_by");

        // 5. Invoices - unsigned_qrcode check? (Already there as signed_qrcode)

        console.log("Schema Fixes Applied Successfully!");

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
