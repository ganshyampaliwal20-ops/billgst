
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugVisibility() {
    try {
        const { default: pool } = await import('./lib/db.ts');
        console.log('--- Debugging Data Visibility ---');

        // 1. List Users
        console.log('\n1. Users in Database:');
        const users = await pool.query('SELECT id, name, email, role FROM users');
        users.rows.forEach(u => console.log(`   - [${u.id}] ${u.email} (${u.role})`));

        if (users.rows.length === 0) {
            console.log('   (No users found)');
        }

        // 2. List Invoices
        console.log('\n2. Invoices in Database:');
        const invoices = await pool.query('SELECT id, invoice_number, created_by, total_amount, created_at FROM invoices');
        invoices.rows.forEach(i => {
            console.log(`   - [${i.invoice_number}] Created By: ${i.created_by} | Amount: ${i.total_amount}`);

            // Check match
            const userExists = users.rows.find(u => u.id === i.created_by);
            if (!userExists) {
                console.log('     ⚠️ WARNING: Creator ID not found in Users table!');
            }
        });

        if (invoices.rows.length === 0) {
            console.log('   (No invoices found)');
        }

        await pool.end();
        process.exit(0);

    } catch (e) {
        console.error('Debug script failed:', e);
        process.exit(1);
    }
}

debugVisibility();
