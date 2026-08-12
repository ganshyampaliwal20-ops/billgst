const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const adminEmails = ['billgstapp@gmail.com', 'ganshyampaliwal20@gmail.com'];
        const userId = '123';
        const query = `
                SELECT e.* FROM expenses e
                LEFT JOIN users u ON u.id = e.created_by
                WHERE u.email = ANY($1) OR e.created_by = $2
                ORDER BY e.expense_date DESC, e.created_at DESC
            `;
        const result = await pool.query(query, [adminEmails, userId]);
        console.log("Query success! Rows:", result.rowCount);
    } catch (e) {
        console.error("Query failed:", e.message);
    } finally {
        pool.end();
    }
}
run();
