const { Pool } = require('pg');
require('dotenv').config({ path: 'f:/bill/.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log("Users table columns:");
    console.log(res.rows.map(r => r.column_name));
    
    // Also check if there's a payments or subscriptions table
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("\nAll tables:", tables.rows.map(r => r.table_name));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
