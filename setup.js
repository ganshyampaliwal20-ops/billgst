import pool, { initDB } from './lib/db.js';
import bcrypt from 'bcryptjs';

async function setup() {
    try {
        console.log('Starting database setup...');

        // Initialize database tables
        await initDB();

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
