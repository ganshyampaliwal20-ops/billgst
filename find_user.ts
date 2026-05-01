import pool from './lib/db.js';

async function checkUsers() {
    try {
        console.log("Fetching users matching 'paliwal' or 'ghanshyam'...");
        const res = await pool.query(`
            SELECT id, name, email, free_invoices_balance
            FROM users 
            WHERE email ILIKE '%paliwal%' OR name ILIKE '%ghanshyam%';
        `);
        console.log("Users:", res.rows);
        
        console.log("\nFetching all referral codes...");
        const res2 = await pool.query(`
            SELECT u.name, rc.code, rc.user_id
            FROM referral_codes rc
            JOIN users u ON rc.user_id = u.id;
        `);
        console.log("Codes:", res2.rows);

        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
checkUsers();
