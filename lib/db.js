
import pg from 'pg';
const { Pool } = pg;

// Fix for "self-signed certificate in certificate chain"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const initDB = async () => {
    // Schema is handled externally or already initialized
    return Promise.resolve();
};

export default pool;
