const { Pool } = require('pg');
require('dotenv').config({ path: 'f:/bill/.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkExpenses() {
  try {
    const res = await pool.query('SELECT * FROM expenses ORDER BY created_at DESC LIMIT 50');
    console.log("Found", res.rows.length, "expenses.");
    const suspicious = res.rows.filter(r => 
        (r.amount && r.amount.toString().includes('383')) || 
        (r.category && r.category.toLowerCase().includes('repair')) ||
        (r.description && r.description.toLowerCase().includes('repair')) ||
        (r.title && r.title.toLowerCase().includes('repair')) ||
        (r.name && r.name.toLowerCase().includes('repair'))
    );
    
    console.log("Suspicious entries:");
    console.table(suspicious);
    
    if(suspicious.length === 0) {
        console.log("Top 5 recent entries instead:");
        console.table(res.rows.slice(0, 5));
    }
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    pool.end();
  }
}
checkExpenses();
