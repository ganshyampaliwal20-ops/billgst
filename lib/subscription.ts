
// Logic for Tiered Pricing
// FREE: 5 Invoices, 30 Quotes, 30 GST Returns per month.
// BASIC_30: Unlimited Invoices/Quotes. GST/QR locked. 30 Days.
// PREMIUM_99: Unlimited All. 30 Days.
// YEARLY_999: Unlimited All. 365 Days.
// LIFETIME: Unlimited All.

import pool from '@/lib/db';
import { startOfMonth, endOfMonth, isAfter } from 'date-fns';

export type PlanType = 'FREE' | 'LIFETIME' | 'BASIC_30' | 'PREMIUM_99' | 'YEARLY_299';
export type FeatureType = 'INVOICE' | 'QUOTATION' | 'GST_RETURN' | 'QR_CODE';

interface LimitCheckResult {
    allowed: boolean;
    reason?: string;
    currentCount?: number;
    maxLimit?: number;
    plan?: PlanType;
}

export async function checkLimit(userId: string, feature: FeatureType): Promise<LimitCheckResult> {
    // TEMPORARY: All features unlocked for early users.
    return { allowed: true, plan: 'LIFETIME' };
    
    const client = await pool.connect();
    try {
        // 1. Get User Plan
        const userRes = await client.query(
            `SELECT plan_type, plan_expiry, subscription_status, created_at, free_invoices_balance FROM users WHERE id = $1`,
            [userId]
        );

        if (userRes.rows.length === 0) {
            return { allowed: false, reason: 'User not found' };
        }

        const user = userRes.rows[0];
        let plan: PlanType = user.plan_type || 'FREE';
        if (user.created_at) {
            const createdDate = new Date(user.created_at);
            if (new Date() <= new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000)) {
                // Grant all premium features for 1st month
                plan = 'LIFETIME';
            }
        }
        const expiry = user.plan_expiry ? new Date(user.plan_expiry) : null;
        let status = user.subscription_status || 'ACTIVE';

        // 2. Check Expiry
        if (plan !== 'FREE' && plan !== 'LIFETIME') {
            if (expiry && isAfter(new Date(), expiry as Date)) {
                status = 'EXPIRED';
            }
        }

        // 3. Unlimited Plans
        if (status === 'ACTIVE' && (plan === 'LIFETIME' || plan === 'PREMIUM_99' || plan === 'YEARLY_299')) {
            return { allowed: true, plan };
        }

        // 4. QR Code Logic (First 10 Free trial, then Basic or Premium)
        if (feature === 'QR_CODE') {
            const totalInvoicesRes = await client.query(
                `SELECT COUNT(*) FROM invoices WHERE created_by = $1`,
                [userId]
            );
            const totalCount = parseInt(totalInvoicesRes.rows[0].count);

            if (totalCount < 10) {
                return { allowed: true, plan };
            }

            if (plan === 'FREE' || status === 'EXPIRED') {
                return { allowed: false, reason: 'Requires Basic (30) or Premium Plan after 10 trial invoices', plan };
            }
            // Basic plan is allowed QR Code now
            if (plan === 'BASIC_30') {
                 return { allowed: true, plan };
            }
        }

        // 5. Monthly Limits setup
        const now = new Date();
        const start = startOfMonth(now).toISOString();
        const end = endOfMonth(now).toISOString();

        let count = 0;
        let limit = 30; // limit for Free

        if (feature === 'INVOICE') {
            if (plan === 'BASIC_30') return { allowed: true, plan }; // Unlimited for Basic
            const countRes = await client.query(
                `SELECT COUNT(*) FROM invoices WHERE created_by = $1 AND created_at >= $2 AND created_at <= $3`,
                [userId, start, end]
            );
            count = parseInt(countRes.rows[0].count);
        } else if (feature === 'QUOTATION') {
            if (plan === 'BASIC_30') return { allowed: true, plan }; // Unlimited for Basic
            
            const countRes = await client.query(
                `SELECT COUNT(*) FROM quotations WHERE created_by = $1 AND created_at >= $2 AND created_at <= $3`,
                [userId, start, end]
            );
            count = parseInt(countRes.rows[0].count);
            limit = 30; // limit for Free
        } else if (feature === 'GST_RETURN') {
            if (plan === 'BASIC_30') return { allowed: true, plan }; // Unlimited for Basic
            
            const countRes = await client.query(
                `SELECT COUNT(*) FROM gst_returns WHERE created_by = $1 AND created_at >= $2 AND created_at <= $3`,
                [userId, start, end]
            );
            count = parseInt(countRes.rows[0].count);
            limit = 30; // limit for Free
        }

        if (count >= limit) {
            if (feature === 'INVOICE' && user.free_invoices_balance > 0) {
                return {
                    allowed: true,
                    currentCount: count,
                    maxLimit: limit,
                    plan,
                    reason: 'USED_FREE_BALANCE'
                };
            }
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
        return { allowed: false, reason: 'System Error Checking Limits' };
    } finally {
        client.release();
    }
}
