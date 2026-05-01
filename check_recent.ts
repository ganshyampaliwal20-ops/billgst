import pool from './lib/db.js';

async function checkRecentUsers() {
    try {
        console.log("Fetching recent users...");
        const res = await pool.query(`
            SELECT id, name, email, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
        console.log("Recent Users:", res.rows);
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
checkRecentUsers();
