const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const query = `
    CREATE TABLE IF NOT EXISTS whatsapp_bot_status (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        qr_code TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

pool.query(query)
    .then(() => console.log('Table created successfully'))
    .catch(console.error)
    .finally(() => pool.end());
