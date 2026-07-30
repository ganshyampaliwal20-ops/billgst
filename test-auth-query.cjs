require('dotenv').config({path: '.env.local'});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pg = require('pg');
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $1 OR name = $1', ['123e4567-e89b-12d3-a456-426614174000']);
        console.log('Query success', res.rowCount);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
