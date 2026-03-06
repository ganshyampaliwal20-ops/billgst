
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testRegister() {
    try {
        const client = await pool.connect();
        const email = 'test' + Math.random() + '@example.com';
        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log("Attempting test insertion...");
        const result = await client.query(
            'INSERT INTO users (name, email, password, role, plan_type, subscription_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            ['Test User', email, hashedPassword, 'USER', 'FREE', 'ACTIVE']
        );
        console.log("Success! New ID:", result.rows[0].id);

        client.release();
        await pool.end();
    } catch (err) {
        console.error('REGISTRATION FAILED WITH ERROR:', err.message);
        console.error('STACK:', err.stack);
    }
}

testRegister();
