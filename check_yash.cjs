require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const uids = ['7bd64c22-359d-4c91-bd88-b6936b5fe830', '3e1fccff-bbee-4f30-93f6-b9554da7af8f'];
    for (const id of uids) {
      console.log(`Checking expenses for ID: ${id}`);
      const expRes = await pool.query("SELECT * FROM expenses WHERE created_by = $1 ORDER BY created_at DESC", [id]);
      console.log("Expenses:", expRes.rows);
    }
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
