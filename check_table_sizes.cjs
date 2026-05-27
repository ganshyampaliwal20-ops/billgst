const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const tables = ['users', 'products', 'customers', 'invoices', 'invoice_items', 'expenses', 'quotations', 'staff', 'attendance'];
        
        for (const table of tables) {
            try {
                const res = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`${table}: ${res.rows[0].count} rows`);
            } catch (e) {
                console.log(`${table}: Table might not exist (${e.message})`);
            }
        }

    } catch (e) {
        console.error("Query failed:", e.message);
    } finally {
        pool.end();
    }
}
run();
