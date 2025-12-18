
import pool from './lib/db.ts';

async function checkUsers() {
    try {
        console.log('Checking users table...');
        const result = await pool.query('SELECT count(*) FROM users');
        console.log('User count:', result.rows[0].count);

        if (parseInt(result.rows[0].count) > 0) {
            const users = await pool.query('SELECT * FROM users LIMIT 1');
            console.log('First user:', users.rows[0]);
        } else {
            console.log('No users found. You need to create a user.');
        }
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        // pool.end() might not be available on the default export if it's just the pool instance
        // checking lib/db.ts again... it exports pool.
        process.exit(0);
    }
}

checkUsers();
