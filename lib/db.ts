import pg from 'pg';
const { Pool } = pg;

let pool: any;

let rawConnectionString = process.env.DATABASE_URL;
let connectionString: string | undefined = undefined;

console.log(`DB Init: Environment Variable Type: ${typeof rawConnectionString}`);
console.log(`DB Init: Environment Variable Length: ${rawConnectionString ? rawConnectionString.length : 'NULL'}`);

// 1. Sanitize
if (rawConnectionString && typeof rawConnectionString === 'string') {
  let sanitized = rawConnectionString.trim();
  // Remove quotes if present
  if (sanitized.startsWith('"') && sanitized.endsWith('"')) sanitized = sanitized.slice(1, -1);
  if (sanitized.startsWith("'") && sanitized.endsWith("'")) sanitized = sanitized.slice(1, -1);

  // Remove query parameters (like ?sslmode=require) to prevent conflicts
  if (sanitized.includes('?')) {
    sanitized = sanitized.split('?')[0];
  }

  if (sanitized.length > 0) {
    connectionString = sanitized;
  }
}

if (connectionString) {
  console.log(`DB Init: Connection String seems valid (starts with ${connectionString.substring(0, 10)}...)`);
} else {
  console.error(`DB Init: Connection String is INVALID or EMPTY after sanitization.`);
}

if (!connectionString) {
  console.error('CRITICAL: DATABASE_URL is missing or invalid!');
  // Mock pool that throws clear error
  pool = {
    connect: async () => {
      console.error("Mock Pool Connect Called");
      throw new Error(`DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.`);
    },
    query: async () => {
      throw new Error('DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.');
    },
    on: () => { },
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
    end: async () => { },
  };
} else {
  try {
    // FORCE connectionString to be a string
    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });
    console.log("DB Init: Pool created successfully.");
  } catch (err: any) {
    console.error('CRITICAL: Failed to create Pool:', err);
    // Fallback to error mock
    pool = {
      connect: async () => { throw new Error(`Pool Creation Failed: ${err.message}`); },
      query: async () => { throw new Error('Pool Creation Failed'); },
      on: () => { },
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0,
      end: async () => { },
    };
  }
}

// Database initialization queries
export const initDB = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('Skipping initDB because DATABASE_URL is missing');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Customers table
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        gstin VARCHAR(15),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        credit_limit DECIMAL(10,2) DEFAULT 0,
        outstanding_balance DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        hsn_code VARCHAR(10),
        unit VARCHAR(20) DEFAULT 'PCS',
        price DECIMAL(10,2) NOT NULL,
        gst_rate DECIMAL(5,2) DEFAULT 18.00,
        stock_quantity INTEGER DEFAULT 0,
        low_stock_alert INTEGER DEFAULT 10,
        category VARCHAR(100),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Invoices table
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(10,2) NOT NULL,
        cgst_amount DECIMAL(10,2) DEFAULT 0,
        sgst_amount DECIMAL(10,2) DEFAULT 0,
        igst_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'UNPAID',
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Invoice Items table
      CREATE TABLE IF NOT EXISTS invoice_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        hsn_code VARCHAR(10),
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        gst_rate DECIMAL(5,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id),
        payment_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        reference_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Stock movements table
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id),
        movement_type VARCHAR(20) NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type VARCHAR(50),
        reference_id UUID,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Settings table
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
    `);

    // Verify/Migrate schema in separate blocks to prevent one failure from blocking others
    try {
      await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);`);
    } catch (e) { console.log('Migration note: checked products.created_by'); }

    try {
      await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);`);
    } catch (e) { console.log('Migration note: checked customers.created_by'); }

    try {
      await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);`);
    } catch (e) { console.log('Migration note: checked invoices.created_by'); }

    console.log('Database tables created/verified successfully');
  } finally {
    client.release();
  }
};

export default pool;
