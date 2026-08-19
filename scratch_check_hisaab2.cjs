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
      return d && d.name === '383 reparing work';
    });
    if(matches.length === 0) return console.log("Not found");
    let account = typeof matches[0].data === 'string' ? JSON.parse(matches[0].data) : matches[0].data;
    console.log("Account Name:", account.name);
    console.log("Balance:", account.balance);
    console.log("Txns Count:", account.txns ? account.txns.length : 0);
    if (account.txns) {
      console.log("Latest 10 txns:");
      console.table(account.txns.slice(0, 10).map(t => ({
        type: t.type,
        amt: t.amt,
        date: t.date,
        name: t.name
      })));
    }
  } catch (err) {
    console.log(err);
  } finally {
    pool.end();
  }
}
checkAll();
