import pg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pg;

dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running direct migrations...');

        // Create Quotations Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id UUID PRIMARY KEY,
        quotation_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_id UUID,
        quotation_date DATE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Quotations table verified');

        // Create Quotation Items Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL
      );
    `);
        console.log('✅ Quotation Items table verified');

        // Create Expenses Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        expense_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        created_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Expenses table verified');

        console.log('🚀 All migrations completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
