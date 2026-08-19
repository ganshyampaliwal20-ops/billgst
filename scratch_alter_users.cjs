const { Pool } = require('pg');
require('dotenv').config({ path: 'f:/bill/.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  try {
    await pool.query("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()");
    console.log("updated_at column added successfully to public.users");
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
