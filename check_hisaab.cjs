const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkHisaabData() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, user_id, updated_at, data
            FROM hisaab_shares 
            WHERE user_id = 'a1ebb56d-83fd-4179-b680-6bc7906e22fe'
            ORDER BY updated_at DESC
        `);

        console.log('Total customers on server:', result.rows.length);
        console.log('='.repeat(60));
        
        result.rows.forEach((row, i) => {
            try {
                const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                const txnCount = data.txns ? data.txns.length : 0;
                const lastTxn = data.txns && data.txns.length > 0 ? data.txns[0] : null;
                console.log(`\n[${i+1}] Customer: ${data.name || 'Unknown'}`);
                console.log(`    ID: ${data.id}`);
                console.log(`    Phone: ${data.phone || '-'}`);
                console.log(`    Transactions: ${txnCount}`);
                console.log(`    Balance: ${data.balance}`);
                console.log(`    Last Synced: ${new Date(row.updated_at).toLocaleString('en-IN')}`);
                if (lastTxn) {
                    console.log(`    Last Entry: ${lastTxn.name || lastTxn.type} - ₹${lastTxn.amt} on ${new Date(lastTxn.date).toLocaleDateString('en-IN')}`);
                }
            } catch(e) {
                console.log(`[${i+1}] Parse error: ${e.message}`);
            }
        });

    } catch(e) {
        console.error('Error:', e.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkHisaabData();
