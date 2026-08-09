require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function run() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS expense_delete_pin VARCHAR(4)');
    console.log("Migration for expense_delete_pin successful.");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    pool.end();
  }
}
run();
