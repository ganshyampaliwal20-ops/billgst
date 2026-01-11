
import pool from './lib/db';

async function migrate() {
    console.log('Starting Subscription Migration...');
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'FREE'; 
                ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expiry TIMESTAMP;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'ACTIVE';
            `);
            console.log('✅ Subscription columns added successfully.');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
