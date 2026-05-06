process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query(`
      UPDATE users 
      SET plan_type = NULL, 
          plan_expiry = NULL, 
          subscription_status = 'INACTIVE', 
          has_claimed_free_plan = false 
      WHERE email = 'ganshyampaliwal20@gmail.com' 
      RETURNING *
    `);
    console.log('Updated user:', res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
