const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("SELECT * FROM customers WHERE user_id = 'a1ebb56d-83fd-4179-b680-6bc7906e22fe'").then(res => {
    console.log(res.rows.map(r => ({ name: r.name, email: r.email, phone: r.phone })));
    pool.end();
});
