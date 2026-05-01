import pool from './lib/db.js';

async function fixReferrals() {
    try {
        console.log("Backfilling referral codes for all users...");
        
        // Find users without codes
        const missingCodesRes = await pool.query(`
            SELECT id, name FROM users 
            WHERE id NOT IN (SELECT user_id FROM referral_codes)
        `);
        
        for (const user of missingCodesRes.rows) {
            const safeName = (user.name || 'USR').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || 'USR';
            const newRefCode = safeName + Math.floor(1000 + Math.random() * 9000);
            
            await pool.query('INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)', [user.id, newRefCode]);
            console.log(`Generated code ${newRefCode} for ${user.name}`);
        }
        
        console.log("Codes generated successfully.");

        // Manually link Manish to Ganshyam
        // We assume Ganshyam Paliwal (ganshyampaliwal20@gmail.com) is the referrer.
        const referrerId = 'a1ebb56d-83fd-4179-b680-6bc7906e22fe'; // Ganshyam Paliwal
        const referredId = '36565651-e3c4-43d6-b3be-f4b24e298e27'; // manish paiwal
        
        // Check if reward already exists
        const existingReward = await pool.query('SELECT id FROM referral_rewards WHERE referrer_id = $1 AND referred_id = $2', [referrerId, referredId]);
        
        if (existingReward.rows.length === 0) {
            console.log("Inserting manual reward for Ganshyam...");
            // Add 20 invoices
            await pool.query('UPDATE users SET free_invoices_balance = COALESCE(free_invoices_balance, 0) + 20 WHERE id = $1', [referrerId]);
            
            // Insert reward record
            await pool.query('INSERT INTO referral_rewards (referrer_id, referred_id, reward_amount) VALUES ($1, $2, 20)', [referrerId, referredId]);
            console.log("Reward inserted and invoices updated!");
        } else {
            console.log("Reward already exists for this pair.");
        }

        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
fixReferrals();
