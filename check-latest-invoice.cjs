const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://default:4kMtTzXJ0hIl@ep-restless-glitter-a4210646-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkLatestInvoice() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
      SELECT i.*, c.name as customer_name, 
             (SELECT json_agg(items) FROM invoice_items items WHERE items.invoice_id = i.id) as items
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
      LIMIT 1
    `);
        console.log('Latest Invoice:', JSON.stringify(res.rows[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkLatestInvoice();
