require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Adding is_deleted column to staff...");
    await pool.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;');
    
    console.log("Setting existing records to FALSE...");
    await pool.query('UPDATE staff SET is_deleted = FALSE WHERE is_deleted IS NULL;');
    
    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    pool.end();
  }
}
run();
