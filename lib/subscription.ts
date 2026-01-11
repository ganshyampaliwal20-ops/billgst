
// Logic for Tiered Pricing
// FREE: 30 Invoices, 30 Quotes, 30 GST Returns per month.
// BASIC_30: Unlimited Invoices/Quotes. GST/QR locked. 30 Days.
// PREMIUM_99: Unlimited All. 30 Days.
// YEARLY_999: Unlimited All. 365 Days.
// LIFETIME: Unlimited All.

import pool from '@/lib/db';
import { startOfMonth, endOfMonth, isAfter } from 'date-fns';

export type PlanType = 'FREE' | 'LIFETIME' | 'BASIC_30' | 'PREMIUM_99' | 'YEARLY_999';
export type FeatureType = 'INVOICE' | 'QUOTATION' | 'GST_RETURN' | 'QR_CODE';

interface LimitCheckResult {
    allowed: boolean;
    reason?: string;
    currentCount?: number;
    maxLimit?: number;
    plan?: PlanType;
}

export async function checkLimit(userId: string, feature: FeatureType): Promise<LimitCheckResult> {
    const client = await pool.connect();
    try {
        // 1. Get User Plan
        const userRes = await client.query(
            `SELECT plan_type, plan_expiry, subscription_status, created_at FROM users WHERE id = $1`,
            [userId]
        );

        if (userRes.rows.length === 0) {
            return { allowed: false, reason: 'User not found' };
        }

        const user = userRes.rows[0];
        const plan: PlanType = user.plan_type || 'FREE';
        const expiry = user.plan_expiry ? new Date(user.plan_expiry) : null;
        let status = user.subscription_status || 'ACTIVE';

        // 2. Check Expiry (if not FREE or LIFETIME)
        if (plan !== 'FREE' && plan !== 'LIFETIME') {
            if (expiry && isAfter(new Date(), expiry)) {
                // Expired! Fallback to FREE restrictions effectively, or strict block?
                // User requirement: "plan exper ho jana chahiye" -> presumably functionality stops or reverts.
                // Let's block "Paid Features" but allow "Free Tier" limits? 
                // Alternatively, mark as EXPIRED and block everything?
                // For now, let's say if expired, they are effectively invalid for paid features.
                status = 'EXPIRED';
            }
        }

        // 3. Unlimited Plans
        if (status === 'ACTIVE' && (plan === 'LIFETIME' || plan === 'PREMIUM_99' || plan === 'YEARLY_999')) {
            return { allowed: true, plan };
        }

        // 4. Basic Plan (30 Rs)
        // Assumption: Unlocks Invoices & Quotes. Blocks GST & QR Code (unless clarified otherwise, but typical upselling).
        // User said: "99 ka primium plan... gst return me... 999 vaala plan me sab access"
        // Implicitly: 30 Rs plan is likely just for Invoices/Quotes limits.
        if (status === 'ACTIVE' && plan === 'BASIC_30') {
            if (feature === 'INVOICE' || feature === 'QUOTATION') {
                return { allowed: true, plan };
            }
            // For GST/QR, fall through to check (or block if exclusive to Premium)
            // Re-reading user request: "30 users ko free milegi... uske baad 99 ka plan" -> Wait.
            // "30 rupye ka plan lena padega jiska 1 month ka plan hoga" for exceeding 30 invoices.
            // So Basic 30 unlocks Invoices.
            if (feature === 'GST_RETURN' || feature === 'QR_CODE') {
                // Basic plan does NOT explicitly say it unlocks GST/QR. Let's block QR Code (Premium feature). 
                // GST might be limited to 30 still? Or unlocked?
                // Let's safe-guess: Basic unlocks Counts, but QR is Premium. GST is Premium?
                // User said: "gst return me... 99 ka plan lagega". 
                // So GST Return > 30 requires 99 Plan? Or 30 Plan?
                // "30 bar generate karne ke baad primum plan lagana hai" (GST Return).
                // So GST Return limit 30 -> Premium (99).
                // Invoice limit 30 -> Basic (30).
                if (feature === 'QR_CODE') return { allowed: false, reason: 'Requires Premium Plan (99)', plan };
            }
        }

        // 5. Free Tier Logic (or Expired Paid Plan falling back to Free Limits)

        // QR Code is Premium Only
        if (feature === 'QR_CODE') {
            return { allowed: false, reason: 'Requires Premium Plan (99)', plan };
        }

        // Check Counts for Current Month
        const now = new Date();
        const start = startOfMonth(now).toISOString();
        const end = endOfMonth(now).toISOString();

        let count = 0;
        let limit = 30; // Default limit

        if (feature === 'INVOICE') {
            const countRes = await client.query(
                `SELECT COUNT(*) FROM invoices WHERE created_by = $1 AND created_at >= $2 AND created_at <= $3`,
                [userId, start, end]
            );
            count = parseInt(countRes.rows[0].count);
        } else if (feature === 'QUOTATION') {
            const countRes = await client.query(
                `SELECT COUNT(*) FROM quotations WHERE created_by = $1 AND created_at >= $2 AND created_at <= $3`,
                [userId, start, end]
            );
            count = parseInt(countRes.rows[0].count);
        } else if (feature === 'GST_RETURN') {
            const countRes = await client.query(
                `SELECT COUNT(*) FROM gst_returns WHERE created_by = $1 AND created_at >= $2 AND created_at <= $3`,
                [userId, start, end]
            );
            count = parseInt(countRes.rows[0].count);
        }

        if (count >= limit) {
            return {
                allowed: false,
                reason: `Monthly limit of ${limit} reached. Upgrade to continue.`,
                currentCount: count,
                maxLimit: limit,
                plan
            };
        }

        return { allowed: true, currentCount: count, maxLimit: limit, plan };

    } catch (error) {
        console.error('Check Limit Error:', error);
        // Fail safe: Allow if DB error to avoid outage? Or block? Block is safer for billing.
        return { allowed: false, reason: 'System Error Checking Limits' };
    } finally {
        client.release();
    }
}
