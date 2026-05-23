const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT user_id, data FROM hisaab_shares').then(res => {
    res.rows.forEach(r => {
        try {
            const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
            console.log(d.name, "-> user_id:", r.user_id, "-> txns:", d.txns ? d.txns.length : 0);
        } catch(e) {}
    });
    pool.end();
});
