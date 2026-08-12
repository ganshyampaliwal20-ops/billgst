
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

async function resetPass() {
    try {
        const client = await pool.connect();
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log("Updating password for billgstapp@gmail.com...");
        const result = await client.query(
            "UPDATE users SET password = $1 WHERE email = 'billgstapp@gmail.com' RETURNING id",
            [hashedPassword]
        );

        if (result.rows.length > 0) {
            console.log("SUCCESS! Password reset to: admin123");
        } else {
            console.log("USER NOT FOUND: billgstapp@gmail.com");
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

resetPass();
