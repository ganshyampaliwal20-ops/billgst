const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgres://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true', ssl: { rejectUnauthorized: false } }); 
async function run() { 
  await client.connect(); 
  const res = await client.query(`SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public'`); 
  console.log(JSON.stringify(res.rows, null, 2)); 
  await client.end(); 
} 
run().catch(console.error);
