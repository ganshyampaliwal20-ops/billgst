import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables *before* importing db
dotenv.config({ path: '.env.local' });

async function setup() {
  try {
    // Dynamic import to ensure env vars are loaded first
    const { default: pool, initDB } = await import('./lib/db.ts');

    console.log('Starting database setup...');
    console.log('DB URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not Loaded');

    // Initialize database tables
    await initDB();

    // Migration: Add missing columns if they don't exist
    console.log('Running migrations...');
    await pool.query(`
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10,2) DEFAULT 0;
    `);
    console.log('Migrations completed.');

    // Create demo admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin User', 'admin@billgst.in', hashedPassword, 'ADMIN']);

    // Insert demo customers
    await pool.query(`
      INSERT INTO customers (name, email, phone, gstin, address, city, state, pincode)
      VALUES 
        ('ABC Traders', 'abc@traders.com', '9876543210', '22AAAAA0000A1Z5', '123 Main St', 'Mumbai', 'Maharashtra', '400001'),
        ('XYZ Corp', 'xyz@corp.com', '9876543211', '27BBBBB1111B1Z6', '456 Market Rd', 'Delhi', 'Delhi', '110001'),
        ('PQR Ltd', 'pqr@ltd.com', '9876543212', '29CCCCC2222C1Z7', '789 Park Ave', 'Bangalore', 'Karnataka', '560001')
      ON CONFLICT DO NOTHING
    `);

    // Insert demo products
    await pool.query(`
      INSERT INTO products (name, description, hsn_code, unit, price, gst_rate, stock_quantity, category)
      VALUES 
        ('Product A', 'High quality product A', '1234', 'PCS', 100.00, 18.00, 500, 'Electronics'),
        ('Product B', 'Premium product B', '5678', 'PCS', 200.00, 12.00, 300, 'Clothing'),
        ('Product C', 'Essential product C', '9012', 'KG', 50.00, 5.00, 1000, 'Food'),
        ('Product D', 'Luxury product D', '3456', 'PCS', 500.00, 28.00, 100, 'Jewelry')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Database setup completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('Email: admin@billgst.in');
    console.log('Password: admin123');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();
