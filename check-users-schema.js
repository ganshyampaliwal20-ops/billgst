
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

async function checkSchema() {
    try {
        const client = await pool.connect();
        console.log("Connected to DB. Checking 'users' table columns...");

        const result = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'quotations' AND column_name = 'created_by';
`);

        if (result.rows.length === 0) {
            console.log("MISSING: created_by column in quotations table");
        } else {
            console.log("FOUND: created_by column in quotations table");
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
