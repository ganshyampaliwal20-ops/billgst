require('dotenv').config({path: '.env.local'});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pg = require('pg');
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query('UPDATE users SET fcm_token = $1 WHERE email = $2', ['test_token', 'ganshyampaliwal20@gmail.com']);
        console.log('Update success', res.rowCount);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
