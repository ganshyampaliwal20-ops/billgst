
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    });
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    console.log('Verifying DB Connection & Schema...');
    const client = await pool.connect();
    try {
        // Try Insert Customer
        const res = await client.query(`
            INSERT INTO customers (name, phone, created_at) 
            VALUES ($1, $2, NOW()) 
            RETURNING id, name
        `, ['Test Customer', '']);
        console.log('Insert Success:', res.rows[0]);
    } catch (e) {
        console.error('Insert Failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

verify();
