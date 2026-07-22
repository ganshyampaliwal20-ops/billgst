const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgres://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true', ssl: { rejectUnauthorized: false } }); 
async function run() { 
  await client.connect(); 
  const res = await client.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND (column_name LIKE '%id' OR column_name = 'id') ORDER BY table_name`); 
  console.log(JSON.stringify(res.rows, null, 2)); 
  await client.end(); 
} 
run().catch(console.error);
