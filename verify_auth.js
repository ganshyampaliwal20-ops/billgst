
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

async function testAuth() {
    try {
        const email = 'billgstapp@gmail.com';
        const pass = 'admin123';

        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            console.log("TEST: User not found");
        } else {
            console.log("TEST: User found. ID:", user.id);
            const match = await bcrypt.compare(pass, user.password);
            console.log("TEST: Password match for 'admin123':", match);

            if (!match) {
                // Let's re-hash and update just to be 1000% sure
                const newHash = await bcrypt.hash(pass, 10);
                await client.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, user.id]);
                console.log("TEST: Password RE-HASHED and UPDATED.");
                const verifyMatch = await bcrypt.compare(pass, newHash);
                console.log("TEST: Verification of new hash:", verifyMatch);
            }
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error('TEST ERROR:', err);
    }
}

testAuth();
