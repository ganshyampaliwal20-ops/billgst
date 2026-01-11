
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { startOfMonth, endOfMonth, isAfter } from 'date-fns';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkLimit(userId, feature) {
    const client = await pool.connect();
    try {
        console.log(`Checking limit for User: ${userId}, Feature: ${feature}`);

        const userRes = await client.query(
            `SELECT plan_type, plan_expiry, subscription_status, created_at FROM users WHERE id = $1`,
            [userId]
        );

        console.log("User Query Result Rows:", userRes.rows.length);
        if (userRes.rows.length > 0) {
            console.log("User Data:", userRes.rows[0]);
        }

        // ... (Simplified logic for test) ...
        return { allowed: true };

    } catch (error) {
        console.error('Check Limit Error:', error);
        return { allowed: false, reason: error.message };
    } finally {
        client.release();
    }
}

async function runTest() {
    try {
        const client = await pool.connect();
        const userRes = await client.query('SELECT id FROM users LIMIT 1');
        client.release();

        if (userRes.rows.length === 0) {
            console.log("No user found.");
            return;
        }

        const userId = userRes.rows[0].id;
        const result = await checkLimit(userId, 'QUOTATION');
        console.log("Result:", result);

        await pool.end();
    } catch (e) {
        console.error(e);
    }
}

runTest();
