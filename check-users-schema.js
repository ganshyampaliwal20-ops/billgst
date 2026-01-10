
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

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);

        console.log("Columns in 'users' table:");
        console.table(res.rows);

        const hasResetToken = res.rows.some(r => r.column_name === 'reset_token');
        const hasResetTokenExpiry = res.rows.some(r => r.column_name === 'reset_token_expiry');

        console.log(`Has reset_token: ${hasResetToken}`);
        console.log(`Has reset_token_expiry: ${hasResetTokenExpiry}`);

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
