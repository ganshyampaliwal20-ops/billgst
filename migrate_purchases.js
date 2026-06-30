import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migratePurchases() {
  console.log('Starting Purchases migration...');
  
  try {
    const client = await pool.connect();
    
    // 1. Suppliers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        gstin VARCHAR(15),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, phone),
        UNIQUE(user_id, email)
      );
    `);
    console.log('suppliers table created or exists.');

    // 2. Purchases Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
        bill_number VARCHAR(50) NOT NULL,
        bill_date DATE DEFAULT CURRENT_DATE,
        sub_total DECIMAL(10, 2) DEFAULT 0,
        cgst_total DECIMAL(10, 2) DEFAULT 0,
        sgst_total DECIMAL(10, 2) DEFAULT 0,
        igst_total DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'COMPLETED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, bill_number, supplier_id)
      );
    `);
    console.log('purchases table created or exists.');

    // 3. Purchase Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        hsn_code VARCHAR(50),
        quantity DECIMAL(10, 2) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        cgst_rate DECIMAL(5, 2) DEFAULT 0,
        sgst_rate DECIMAL(5, 2) DEFAULT 0,
        igst_rate DECIMAL(5, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('purchase_items table created or exists.');

    // 4. Supplier Payments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
        purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date DATE DEFAULT CURRENT_DATE,
        payment_method VARCHAR(50) DEFAULT 'CASH',
        reference_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('supplier_payments table created or exists.');

    client.release();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migratePurchases();
