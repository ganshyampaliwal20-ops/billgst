
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runDebug() {
    const client = await pool.connect();
    try {
        console.log("Connected. Starting Debug Insert...");

        // 1. Get a valid user
        const userRes = await client.query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log("No users found. Creating one...");
            // handle creation if needed, but likely exists
            throw new Error("No users found to test with");
        }
        const userId = userRes.rows[0].id;
        console.log("Using User ID:", userId);

        const quoId = uuidv4();
        const quoNumber = `TEST-${Date.now()}`;

        await client.query('BEGIN');

        console.log("Inserting Quotation...");
        await client.query(`
            INSERT INTO quotations (
                id, quotation_number, customer_name, customer_id, quotation_date, 
                total_amount, status, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            quoId,
            quoNumber,
            'Test Customer',
            null, // customer_id
            '2024-01-01',
            100.00,
            'Pending',
            'Debug Note',
            userId
        ]);

        console.log("Inserting Item...");
        await client.query(`
            INSERT INTO quotation_items (
                quotation_id, product_name, quantity, unit_price, total_amount
            ) VALUES ($1, $2, $3, $4, $5)
        `, [
            quoId,
            'Test Product',
            1,
            100,
            100
        ]);

        await client.query('ROLLBACK'); // Rollback so we don't junk the DB
        console.log("Success! Transaction worked (Rolled back).");

    } catch (err) {
        console.error("DEBUG FAILURE:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

runDebug();
