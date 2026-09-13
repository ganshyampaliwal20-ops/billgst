
import { Pool } from 'pg';

// Fix for SSL errors in some environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const initDB = async () => {
    // This is a placeholder to prevent import errors in API routes.
    // The actual schema should be managed via migrations or separate scripts.
    console.log('initDB called (placeholder)');
    return Promise.resolve();
};

export default pool;
