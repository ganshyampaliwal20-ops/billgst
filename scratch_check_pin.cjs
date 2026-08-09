require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function run() {
  try {
    const res = await pool.query('SELECT id, phone, expense_delete_pin FROM users WHERE expense_delete_pin IS NOT NULL');
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
