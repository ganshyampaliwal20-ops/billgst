const { Pool } = require('pg');
require('dotenv').config({ path: 'f:/bill/.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAll() {
  try {
    const res = await pool.query('SELECT data FROM hisaab_shares');
    const matches = res.rows.filter(r => {
      let d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
      return d && d.name && d.name.toLowerCase().includes('383');
    });
    console.log('Found:', matches.map(m => {
      let d = typeof m.data === 'string' ? JSON.parse(m.data) : m.data;
      return {
        name: d.name,
        balance: d.balance,
        txnsCount: d.txns ? d.txns.length : 0
      };
    }));
  } catch (err) {
    console.log(err);
  } finally {
    pool.end();
  }
}
checkAll();
