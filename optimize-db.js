import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function optimizeDB() {
    try {
        const client = await pool.connect();
        console.log("Connected to DB. Running Optimizations...");

        const queries = [
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);`,
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_created_by ON customers(created_by);`,
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_by ON products(created_by);`,
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotations_created_by ON quotations(created_by);`,
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);`,
            
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);`,
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);`,
            
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);`,
            `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);`
        ];

        for (const q of queries) {
            try {
                console.log("Running:", q);
                await client.query(q);
            } catch (e) {
                console.log("Note:", e.message);
            }
        }

        console.log("DB Optimization Applied Successfully!");
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Optimization failed:', err);
        process.exit(1);
    }
}

optimizeDB();
