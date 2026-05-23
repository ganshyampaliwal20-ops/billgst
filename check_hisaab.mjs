// Script to check hisaab_shares table data
import pool from './lib/db.js';

async function checkHisaab() {
    const client = await pool.connect();
    try {
        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'hisaab_shares'
            ) as exists
        `);
        console.log('Table exists:', tableCheck.rows[0].exists);

        if (tableCheck.rows[0].exists) {
            const count = await client.query(`SELECT COUNT(*) as total FROM hisaab_shares`);
            console.log('Total rows in hisaab_shares:', count.rows[0].total);

            const sample = await client.query(`
                SELECT id, user_id, updated_at, 
                    LENGTH(data::text) as data_size
                FROM hisaab_shares 
                ORDER BY updated_at DESC 
                LIMIT 10
            `);
            console.log('\nLatest entries:');
            sample.rows.forEach(r => {
                console.log(`  ID: ${r.id} | User: ${r.user_id} | Updated: ${r.updated_at} | Size: ${r.data_size} bytes`);
            });
        }
    } catch(e) {
        console.error('Error:', e.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

checkHisaab();
