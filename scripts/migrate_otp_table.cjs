const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Creating otp_verifications table...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
        `);
        
        console.log('✅ otp_verifications table created successfully!');
    } catch (error) {
        console.error('❌ Migration error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
