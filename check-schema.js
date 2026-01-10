
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/billgst',
});

async function checkSchema() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products';
        `);
        console.log('Products Table Schema:', res.rows);
        client.release();
    } catch (e) {
        console.error('Schema check failed:', e);
    } finally {
        pool.end();
    }
}

checkSchema();
