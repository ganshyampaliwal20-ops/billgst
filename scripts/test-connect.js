import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const { Pool } = pg;

console.log('Testing connection to:', process.env.DATABASE_URL?.split('@')[1] || 'URL not found'); // Hide password

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        const client = await pool.connect();
        console.log('✅ Connected successfully!');

        const res = await client.query('SELECT NOW()');
        console.log('Time from DB:', res.rows[0].now);

        const userRes = await client.query('SELECT count(*) FROM users');
        console.log('User count:', userRes.rows[0].count);

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.code) console.error('Error Code:', err.code);
        process.exit(1);
    }
}

testConnection();
