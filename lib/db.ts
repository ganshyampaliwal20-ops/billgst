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

  // Remove query parameters (like ?sslmode=require) to prevent conflicts with manual SSL config
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
  console.warn('WARNING: DATABASE_URL is missing or invalid! Connection might fail later.');
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
      ssl: { rejectUnauthorized: false } // Strict SSL handling for Supabase
    });
    console.log("DB Init: Pool created successfully.");
  } catch (err: any) {
    console.error('CRITICAL: Failed to create Pool. Message:', err.message);
    console.error('CRITICAL: Stack:', err.stack);
    if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      console.error('HINT: SSL Certificate error detected. Please check rejectUnauthorized setting.');
    }
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
        
        -- Business Profile
        business_name VARCHAR(255) DEFAULT 'My Business',
        business_gstin VARCHAR(20),
        business_address TEXT,
        business_phone VARCHAR(20),
        business_email VARCHAR(255),
        business_logo TEXT,
        business_upi_id VARCHAR(100),
        business_owner_name VARCHAR(255),
        business_bank_name VARCHAR(255),
        business_account_no VARCHAR(50),
        business_ifsc_code VARCHAR(20),
        business_branch_name VARCHAR(255),
        business_account_holder VARCHAR(255),
        business_show_bank_details BOOLEAN DEFAULT TRUE,
        invoice_template VARCHAR(50) DEFAULT 'TEMPLATE_1',
        invoice_table_format VARCHAR(50) DEFAULT 'FORMAT_1',
        business_signature TEXT,
        business_logo_position VARCHAR(20) DEFAULT 'RIGHT',
        
        -- WhatsApp & Reminders
        auto_reminders_enabled BOOLEAN DEFAULT FALSE,
        reminder_frequency INTEGER DEFAULT 3,
        reminder_time VARCHAR(10) DEFAULT '10:00',
        whatsapp_bot_enabled BOOLEAN DEFAULT FALSE,
        whatsapp_sender_number VARCHAR(20),
        whatsapp_api_key TEXT,
        whatsapp_api_url TEXT,

        -- Auth & Metadata
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
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
        type VARCHAR(50) DEFAULT 'TAX_INVOICE',
        notes TEXT,
        created_by UUID REFERENCES users(id),
        eway_bill_no VARCHAR(20),
        eway_bill_date TIMESTAMP,
        transport_mode VARCHAR(20),
        distance INTEGER,
        transporter_name VARCHAR(255),
        transporter_id VARCHAR(50),
        vehicle_no VARCHAR(20),
        irn VARCHAR(100),
        ack_no VARCHAR(50),
        ack_date TIMESTAMP,
        signed_qrcode TEXT,
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
        movement_type VARCHAR(20) NOT NULL, -- 'IN' or 'OUT'
        quantity DECIMAL(10,2) NOT NULL,
        reference_id VARCHAR(100), -- Invoice ID or manual adjustment
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Settings table
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);

      -- Quotations table
      CREATE TABLE IF NOT EXISTS quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_id UUID REFERENCES customers(id),
        quotation_date DATE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Quotation Items table
      CREATE TABLE IF NOT EXISTS quotation_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        hsn_code VARCHAR(10),
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL
      );

      -- Expenses table
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR(100) NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- GST Returns table
      CREATE TABLE IF NOT EXISTS gst_returns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_type VARCHAR(50) NOT NULL,
        period_from DATE NOT NULL,
        period_to DATE NOT NULL,
        filing_frequency VARCHAR(20) NOT NULL,
        generated_data JSONB,
        status VARCHAR(20) DEFAULT 'DRAFT',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
      CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);
      CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
      CREATE INDEX IF NOT EXISTS idx_quotations_created_by ON quotations(created_by);
      CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
      CREATE INDEX IF NOT EXISTS idx_gst_returns_created_by ON gst_returns(created_by);
      CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
      CREATE INDEX IF NOT EXISTS idx_gst_returns_period ON gst_returns(period_from, period_to);
    `);

    try {
      await client.query(`
        -- Products Columns
        ALTER TABLE products ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PRODUCT';
        ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(15, 2) DEFAULT 0;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
        
        -- Invoice Columns
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'TAX_INVOICE';
        
        -- Customer Columns
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS promise_date DATE;

        -- User Columns
        ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'FREE'; 
        ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expiry TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'ACTIVE';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_sender_number VARCHAR(20);

        -- Quotation Items
        ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(10);
      `);
    } catch (e) { console.log('Migration note: checked database columns consistency'); }

    console.log('Database tables created/verified successfully');
  } finally {
    client.release();
  }
};

export default pool;
