
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/billgst',
});

async function checkSchema() {
    try {
        const client = await pool.connect();
        console.log('Connected to DB');
        const res = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'invoices';
        `);
        console.log('Invoices Table Schema:', JSON.stringify(res.rows, null, 2));
        client.release();
    } catch (e) {
        console.error('Schema check failed:', e);
    } finally {
        await pool.end();
    }
}

checkSchema();
