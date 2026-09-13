import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoices'`);
    console.log(res.rows);
    pool.end();
}
run();
