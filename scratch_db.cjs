const { Pool } = require('pg'); 
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/billgst' }); 
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'expenses'").then(r => console.log(r.rows)).catch(console.error).finally(() => pool.end());
