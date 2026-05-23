import pg from 'pg';
const { Pool } = pg;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: 'postgres://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('Resetting corrupted global user roles...');
  const res = await pool.query(`
    UPDATE users 
    SET role = 'USER' 
    WHERE role NOT IN ('USER', 'OWNER', 'ADMIN')
  `);
  console.log(`Reset ${res.rowCount} users to 'USER' role.`);
  pool.end();
}

main().catch(console.error);
