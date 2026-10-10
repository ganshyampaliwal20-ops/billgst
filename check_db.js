const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("SELECT CAST(column_name AS TEXT) as col FROM information_schema.columns WHERE table_name = 'hisaab_shares'")
    .then(r => console.log(r.rows.map(x => x.col)))
    .catch(console.error)
    .finally(() => process.exit(0));
