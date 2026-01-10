
import fs from 'fs';
import path from 'path';

console.log('Reading .env.local...');
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const firstEqualIndex = line.indexOf('=');
        if (firstEqualIndex !== -1) {
            const key = line.substring(0, firstEqualIndex).trim();
            const value = line.substring(firstEqualIndex + 1).trim().replace(/^["']|["']$/g, '');
            if (key) {
                process.env[key] = value;
            }
        }
    });
    console.log('Environment variables loaded.');
} else {
    console.warn('.env.local not found!');
}

async function resetDB() {
    console.log('Importing DB module...');
    // Dynamic import to ensure process.env is set before db.js is evaluated
    const { default: pool, initDB } = await import('./lib/db.js');

    console.log('Resetting Database...');
    let client;
    try {
        client = await pool.connect();
        await client.query('DROP TABLE IF EXISTS invoice_items CASCADE');
        await client.query('DROP TABLE IF EXISTS payments CASCADE');
        await client.query('DROP TABLE IF EXISTS stock_movements CASCADE');
        await client.query('DROP TABLE IF EXISTS invoices CASCADE');
        await client.query('DROP TABLE IF EXISTS products CASCADE');
        await client.query('DROP TABLE IF EXISTS customers CASCADE');
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        await client.query('DROP TABLE IF EXISTS settings CASCADE');
        console.log('Tables Dropped.');

        console.log('Re-initializing DB with new Schema...');
        await initDB();
        console.log('Database Reset Complete.');
    } catch (error) {
        console.error('Reset Failed:', error);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

resetDB();
