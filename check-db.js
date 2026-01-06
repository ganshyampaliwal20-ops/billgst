import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log('Checking DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
        const client = await pool.connect();
        console.log('Successfully connected to the database.');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Tables found:', res.rows.map(r => r.table_name).join(', '));

        const requiredTables = ['quotations', 'quotation_items', 'expenses'];
        const missingTables = requiredTables.filter(t => !res.rows.find(r => r.table_name === t));

        if (missingTables.length > 0) {
            console.log('MISSING TABLES:', missingTables.join(', '));
        } else {
            console.log('All required tables for Quotations and Expenses are present.');
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Database connection error:', err.message);
    }
}

check();
