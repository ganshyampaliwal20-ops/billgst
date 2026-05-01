const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        code VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('referral_codes table created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID REFERENCES users(id),
        referred_id UUID REFERENCES users(id),
        reward_amount INT DEFAULT 20,
        status VARCHAR(20) DEFAULT 'JOINED',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('referral_rewards table created');

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS free_invoices_balance INT DEFAULT 0;
    `);
    console.log('free_invoices_balance added to users');
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}

migrate();
