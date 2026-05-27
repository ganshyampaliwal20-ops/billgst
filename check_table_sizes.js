const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Checking products table...");
        const res = await pool.query(`
            SELECT 
                COUNT(*) as count,
                SUM(LENGTH(image_url)) as image_size 
            FROM products;
        `);
        console.log("Products:", res.rows[0]);

        console.log("Checking users table...");
        const res2 = await pool.query(`
            SELECT 
                COUNT(*) as count,
                SUM(LENGTH(business_logo)) as logo_size,
                SUM(LENGTH(business_signature)) as sig_size,
                SUM(LENGTH(store_banner)) as banner_size
            FROM users;
        `);
        console.log("Users:", res2.rows[0]);
        
        console.log("Checking invoice items...");
        const res3 = await pool.query(`
            SELECT COUNT(*) as count FROM invoice_items;
        `);
        console.log("Invoice Items:", res3.rows[0]);

    } catch (e) {
        console.error("Query failed:", e.message);
    } finally {
        pool.end();
    }
}
run();
