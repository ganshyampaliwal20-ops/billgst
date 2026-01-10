import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        console.log("Testing connection to:", process.env.DATABASE_URL ? "URL found" : "No URL found");
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('✅ Connection successful based on current .env.local!');
        console.log('Time from DB:', res.rows[0].now);
        client.release();
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        await pool.end();
        process.exit(1);
    }
}

testConnection();
