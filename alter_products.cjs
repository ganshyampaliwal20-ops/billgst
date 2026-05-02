process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
    console.log("Current columns:", res.rows);
    
    // Add columns if they don't exist
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_alert_days INTEGER DEFAULT 10`);
    console.log("Added expiry_date and expiry_alert_days columns.");
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
main();
