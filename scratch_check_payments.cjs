const { Pool } = require('pg');
require('dotenv').config({ path: 'f:/bill/.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'payments' AND table_schema = 'public'");
    console.log("Payments table columns:");
    console.log(res.rows.map(r => r.column_name));
  } catch (e) {
  } finally {
    pool.end();
  }
}
check();
