import pg from 'pg';
const { Pool } = pg;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: 'postgres://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const users = await pool.query('SELECT id, name, email, role FROM users');
  console.log('--- ALL USERS ---');
  console.table(users.rows);

  const staff = await pool.query('SELECT id, email, role, created_by FROM staff');
  console.log('\n--- ALL STAFF ---');
  console.table(staff.rows);

  const invoices = await pool.query('SELECT id, invoice_number, created_by FROM invoices LIMIT 10');
  console.log('\n--- INVOICES (Sample) ---');
  console.table(invoices.rows);

  pool.end();
}

main().catch(console.error);
